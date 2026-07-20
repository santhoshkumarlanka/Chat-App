import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from './routes/auth.route.js';
import messegeRoutes from './routes/message.route.js';
import groupRoutes from './routes/group.route.js';

import { globalLimiter } from "./middleware/rateLimiter.middleware.js";
import { connectDB } from './lib/db.js';
import { app, server } from "./lib/socket.js";

// import path from "path";
// const __dirname = path.resolve();


dotenv.config();  
const port = process.env.PORT || 5001;

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

//console.log("CLIENT_URL =", process.env.CLIENT_URL);
//console.log("NODE_ENV =", process.env.NODE_ENV);


console.log("========== ENV ==========");
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("=========================");

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Chat API is running",
  });
});



app.use("/api", globalLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messegeRoutes);
app.use("/api/groups", groupRoutes);

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("/{*any}", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

// express.static is a built-in middleware function in Express. It tells the server to automatically serve any static files (images, CSS files, JavaScript bundles) requested by the client from a specific folder without you having to write individual routes for each file.


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});