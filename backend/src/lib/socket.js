import { Server } from "socket.io";
import http from "http";
import express from "express";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import Group from "../models/group.model.js";

const app = express();
const server = http.createServer(app);

// Initialize Redis Clients
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("REDIS_URL is not defined in the environment variables!");
}

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

// Connect to Redis
Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    console.log("Connected to Redis successfully");
  })
  .catch((err) => {
    console.error("Redis connection error:", err.message);
  });

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
  adapter: createAdapter(pubClient, subClient),
});

// Used to get the socket ID of a specific online user from the shared Redis hash map
export async function getReceiverSocketId(receiverId) {
  if (!receiverId) return null;
  try {
    return await pubClient.hGet("online_users", receiverId.toString());
  } catch (error) {
    console.error("Error in getReceiverSocketId from Redis:", error.message);
    return null;
  }
}

// Get the array of all online user IDs from Redis
export async function getOnlineUsers() {
  try {
    return await pubClient.hKeys("online_users");
  } catch (error) {
    console.error("Error in getOnlineUsers from Redis:", error.message);
    return [];
  }
}

io.on("connection", async (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    try {
      // Store online status in Redis hash
      await pubClient.hSet("online_users", userId.toString(), socket.id);

      // Broadcast updated online users list
      const onlineUsers = await getOnlineUsers();
      io.emit("getOnlineUsers", onlineUsers);

      // Join all group rooms this user belongs to
      Group.find({ members: userId }).then((groups) => {
        groups.forEach((group) => {
          socket.join(group._id.toString());
          console.log(`User ${userId} joined room ${group._id}`);
        });
      }).catch((err) => {
        console.error("Error joining group rooms on socket connect: ", err.message);
      });
    } catch (error) {
      console.error("Error during connection setup in Redis:", error.message);
    }
  }

  socket.on("disconnect", async () => {
    console.log("user disconnected", socket.id);
    if (userId && userId !== "undefined") {
      try {
        // Remove from Redis hash
        await pubClient.hDel("online_users", userId.toString());

        // Broadcast updated online users list
        const onlineUsers = await getOnlineUsers();
        io.emit("getOnlineUsers", onlineUsers);
      } catch (error) {
        console.error("Error during disconnect cleanup in Redis:", error.message);
      }
    }
  });
});

export { io, app, server };
