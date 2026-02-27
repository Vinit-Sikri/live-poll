import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import pollRoutes from "./routes/pollRoutes";
import { registerPollSocket } from "./sockets/pollSocket";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());
app.use(express.json());
app.use("/api/polls", pollRoutes);

app.get("/", (req, res) => {
  res.send("Live Polling Backend Running");
});

mongoose.connect(process.env.MONGO_URI as string, {
  serverSelectionTimeoutMS: 5000,
  family: 4 
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log("DB Error:", err));

io.on("connection", (socket) => {
  console.log(" User Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
registerPollSocket(io);