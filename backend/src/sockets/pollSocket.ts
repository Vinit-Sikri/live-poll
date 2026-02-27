import { Server } from "socket.io";
import pollService from "../services/pollService";
import Poll from "../models/Poll";

const students = new Map<string, string>();
const chatHistory: { sender: string; text: string; timestamp: string }[] = [];

export const registerPollSocket = (io: Server) => {
  setInterval(async () => {
    const closed = await pollService.closePollIfExpired();
    if (closed) {
      const results = await pollService.getResults(closed._id.toString());
      io.emit("poll:results", results);
      io.emit("poll:ended");
    }
  }, 1000);

  io.on("connection", async (socket) => {
    // Send existing data on connect
    socket.emit("student:list", Array.from(students.entries()).map(([id, name]) => ({ id, name })));
    socket.emit("chat:history", chatHistory);

    socket.on("student:getList", () => {
      socket.emit("student:list", Array.from(students.entries()).map(([id, name]) => ({ id, name })));
    });

    // Check for unique name when joining
    socket.on("student:join", (name: string, callback?: (res: { success: boolean; message?: string }) => void) => {
      const nameExists = Array.from(students.values()).some(
        (existingName) => existingName.toLowerCase() === name.toLowerCase()
      );

      if (nameExists) {
        if (callback) callback({ success: false, message: "Name is already taken. Please choose another one." });
        return;
      }

      students.set(socket.id, name);
      io.emit("student:list", Array.from(students.entries()).map(([id, name]) => ({ id, name })));
      if (callback) callback({ success: true });
    });

    // Handle Chat
    socket.on("chat:sendMessage", (data: { sender: string; text: string }) => {
      const message = { ...data, timestamp: new Date().toISOString() };
      chatHistory.push(message);
      if (chatHistory.length > 100) chatHistory.shift(); // Keep only the last 100 messages
      io.emit("chat:newMessage", message);
    });

    const active = await pollService.getActivePoll();
    if (active) socket.emit("poll:active", active);

    socket.on("poll:getActive", async () => {
      const currentActive = await pollService.getActivePoll();
      if (currentActive) socket.emit("poll:active", currentActive);
    });

    socket.on("poll:getResults", async () => {
      const latestPoll = await Poll.findOne().sort({ createdAt: -1 });
      if (latestPoll) {
        const results = await pollService.getResults(latestPoll._id.toString());
        socket.emit("poll:results", results);
      }
    });

    socket.on("poll:create", async (data) => {
      await pollService.createPoll(data.question, data.options, data.duration, data.correctOptionIndex);
      const activePoll = await pollService.getActivePoll();
      io.emit("poll:active", activePoll);
    });

    socket.on("poll:vote", async (data) => {
      try {
        await pollService.submitVote(data.pollId, data.studentId, data.optionIndex);
        const results = await pollService.getResults(data.pollId);
        io.emit("poll:results", results);
      } catch {
        socket.emit("poll:error", "Already voted");
      }
    });

    socket.on("student:kick", (targetSocketId: string) => {
      io.to(targetSocketId).emit("student:kicked_by_teacher");
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) targetSocket.disconnect();
    });

    socket.on("disconnect", () => {
      students.delete(socket.id);
      io.emit("student:list", Array.from(students.entries()).map(([id, name]) => ({ id, name })));
    });
  });
};