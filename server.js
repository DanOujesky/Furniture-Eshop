import express from "express";
import http from "http";
import { Server } from "socket.io";
import crypto from "crypto";
import dotenv from "dotenv";
import { z } from "zod";

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

const schema = z.object({
  address: z.string().min(3),
  socket_id: z.string(),

  furniture: z.array(
    z.object({
      name: z.string().min(1),
      dimensions: z.object({
        width: z.number().positive(),
        length: z.number().positive(),
        height: z.number().positive(),
      }),
      weight: z.number().positive(),
      count: z.number().positive(),
      
    })
  ),
});

app.use(express.static("public"));



app.post(
  "/order/update",
  express.raw({ type: "application/json" }),
  handleWebhook
);

function handleWebhook(req, res) {
  console.log("prislo");
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
  const order = orders.get(order_id);

  if (order) {
    io.to(order.socket_id).emit("orderUpdate", {
      order_id,
      status,
    });
    console.log("odeslano na frontend");
  }
 

  res.sendStatus(200);
}

app.use(express.json());
app.post("/order", async (req, res) => {
  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: validation.error.errors });
  }
  const { address, furniture, socket_id } = validation.data;
  console.log("Received order:", { address, furniture });

  const order_id = crypto.randomUUID();
  const event_id = crypto.randomUUID();

  orders.set(order_id, {socket_id: socket_id, status: ""})

  const payload = {
    order_id: order_id,
    event_id: event_id,
    callbackUrl: `${ESHOP_URL}:${ESHOP_PORT}/order/update`,
    address: address,
    furniture: furniture,
  };
  console.log(payload);

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

  console.log("connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("isconnected", socket.id);
  });
});

server.listen(ESHOP_PORT, () => {
  console.log(`E-shop running at ${ESHOP_URL}:${ESHOP_PORT}`);
});
