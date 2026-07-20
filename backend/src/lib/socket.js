import { Server } from "socket.io";
import http from "http";
import express from "express";
import Group from "../models/group.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(receiverId) {
  return userSocketMap[receiverId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;

    // Join all group rooms this user belongs to
    Group.find({ members: userId }).then((groups) => {
      groups.forEach((group) => {
        socket.join(group._id.toString());
        console.log(`User ${userId} joined room ${group._id}`);
      });
    }).catch((err) => {
      console.error("Error joining group rooms on socket connect: ", err.message);
    });
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
