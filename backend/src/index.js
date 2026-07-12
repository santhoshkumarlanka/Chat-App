import express from 'express';
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from './lib/db.js';


import authRoutes from './routes/auth.route.js';
import messegeRoutes from './routes/message.route.js';


dotenv.config();  
const app = express()
const port = process.env.PORT;

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages",messegeRoutes);


app.get("/",(req,res)=>{
  res.send('src/index.js  ');
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDB();
});