import express from 'express';
import authRoutes from './routes/auth.route.js';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from './lib/db.js';

dotenv.config();  
const app = express()
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);