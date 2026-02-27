import { io } from "socket.io-client";

export const socket = io("https://live-poll-95x0.onrender.com", {
  autoConnect: false,
});