import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from './lib/db.js';
import cors from "cors";

import authRoutes from './routes/auth.route.js';
import messegeRoutes from './routes/message.route.js';
import { app, server } from "./lib/socket.js";

import path from "path";

dotenv.config();  
const port = process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messegeRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// express.static is a built-in middleware function in Express. It tells the server to automatically serve any static files (images, CSS files, JavaScript bundles) requested by the client from a specific folder without you having to write individual routes for each file.


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});