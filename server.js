import express from "express";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.static("public"));

app.post("/api/order", (req, res) => {
  res.json({ status: "ok" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
