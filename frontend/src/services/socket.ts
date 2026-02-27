import { io } from "socket.io-client";

export const socket = io("https://live-polling-system-dema.onrender.com", {
  autoConnect: false,
});