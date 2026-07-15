import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from './lib/db.js';
import cors from "cors";

import authRoutes from './routes/auth.route.js';
import messegeRoutes from './routes/message.route.js';
import { app, server } from "./lib/socket.js";

dotenv.config();  
const port = process.env.PORT || 5001;

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

app.get("/", (req, res) => {
  res.send('src/index.js  ');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});