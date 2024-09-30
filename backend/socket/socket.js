import { Server } from "socket.io";
import http from "http";
import express from "express";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

export const getRecipentSocketId = (recipentId) => {
  return userSocketMap[recipentId];
};

const userSocketMap = {}; //userId: socketId

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId !== "undefined") userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
    try {
      await Message.updateMany(
        { conversationId: conversationId, seen: false },
        { $set: { seen: true } }
      );
      await Conversation.updateOne(
        { _id: conversationId },
        { $set: { "lastMessage.seen": true } }
      );
      io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
    } catch (error) {
      console.log(error);
    }
  });

  // Xử lý cuộc gọi video
  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    io.to(userSocketMap[userToCall]).emit("callUser", {
      signal: signalData,
      from,
      name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(userSocketMap[data.to]).emit("callAccepted", data.signal);
  });

  socket.on("endCall", ({ userId, otherId }) => {
    io.to(userSocketMap[otherId]).emit("callEnded");
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
