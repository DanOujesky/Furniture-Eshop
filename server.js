import express from "express";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import crypto from "crypto";


const ESHOP_PORT = process.env.ESHOP_PORT;
const COURIER_PORT = process.env.COURIER_PORT;

const SHARED_SECRET = process.env.SHARED_SECRET;

const ESHOP_URL = process.env.ESHOP_URL;
const COURIER_URL = process.env.COURIER_URL;

const app = express();

const processedEvents = new Set();
const orders = {};

app.use(express.static("public"));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.post("/order/update", (req, res) => {
  const sigHeader = (req.get("X-Signature") || "").trim();
  const rawBody = req.body;
  const rawString = rawBody.toString("utf8");

  const expected = crypto
    .createHmac("sha256", SHARED_SECRET)
    .update(rawString)
    .digest("hex");

  if (sigHeader !== expected) {
    console.log("Invalid signature – webhook odmítnut");
    return res.status(401).send("Invalid signature");
  }
  const data = JSON.parse(rawString);

  const { event_id, id, status } = data;

  if (processedEvents.has(event_id)) {
    console.log(`Duplicitní event ${event_id} ignorován`);
    return res.sendStatus(200);
  }

  processedEvents.add(event_id);

  orders[id] = { id, status };
  io.emit("orderUpdate", { id, status });

  res.sendStatus(200);
});

app.post("/order", (req, res) => {
  const order = req.body;
  const order_id = crypto.randomUUID();
  const event_id = crypto.randomUUID();

  fetch(`${COURIER_URL}${COURIER_PORT}/order`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    order_id: order_id,
    callbackUrl: `${ESHOP_URL}${ESHOP_PORT}/order/update`,
    event_id: event_id,
    adress: order.adress,
    furniture: order.furniture
  }),
  })
  .then((res) => res.status)
  .then((status) => console.log("Courier response:", status));
});



io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(ESHOP_PORT, () => {
  console.log(`Server running at ${ESHOP_URL}${ESHOP_PORT}`);
});
