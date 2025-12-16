import express from "express";
import http from "http";
import { Server } from "socket.io";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const { ESHOP_PORT, COURIER_PORT, ESHOP_URL, COURIER_URL, SHARED_SECRET } =
  process.env;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const orders = new Map();
const processedEvents = new Set();
let adminSocket = null;

app.use(express.static("public"));

app.use(express.json());

app.post(
  "/order/update",
  express.raw({ type: "application/json" }),
  handleWebhook
);

function handleWebhook(req, res) {
  const signature = req.get("X-Signature") || "";
  const rawBody = req.body;

  const expectedSignature = crypto
    .createHmac("sha256", SHARED_SECRET)
    .update(rawBody)
    .digest("hex");

  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    console.log("Invalid webhook signature");
    return res.sendStatus(401);
  }

  const data = JSON.parse(rawBody.toString("utf8"));
  const { event_id, order_id, status } = data;

  if (processedEvents.has(event_id)) {
    return res.sendStatus(200);
  }

  processedEvents.add(event_id);
  orders.set(order_id, status);

  if (adminSocket) {
    adminSocket.emit("orderUpdate", { order_id, status });
  }

  res.sendStatus(200);
}

app.post("/order", async (req, res) => {
  const order = req.body;

  const order_id = crypto.randomUUID();
  const event_id = crypto.randomUUID();

  const payload = {
    order_id,
    event_id,
    callbackUrl: `${ESHOP_URL}:${ESHOP_PORT}/order/update`,
    address: order.address,
    furniture: order.furniture,
  };

  const signature = crypto
    .createHmac("sha256", SHARED_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");

  try {
    const response = await fetch(`${COURIER_URL}:${COURIER_PORT}/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Signature": signature,
      },
      body: JSON.stringify(payload),
    });

    res.status(201).json({
      order_id,
      courierStatus: response.status,
    });
  } catch (err) {
    console.error("Courier error:", err);
    res.sendStatus(500);
  }
});

io.on("connection", (socket) => {
  if (adminSocket) {
    socket.disconnect(true);
    return;
  }

  adminSocket = socket;
  console.log("✅ Admin connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Admin disconnected");
    adminSocket = null;
  });
});

server.listen(ESHOP_PORT, () => {
  console.log(`E-shop running at ${ESHOP_URL}:${ESHOP_PORT}`);
});
