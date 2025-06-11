import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
// index.js or server.js
import dotenv from 'dotenv';
dotenv.config();


// app config
const app = express()
const port = process.env.PORT ;
 


// middlewares
app.use(express.json())
app.use(cors()) // using this we can access any frontend from backend

app.get("/", (req, res) => {
    res.send("API Working")
  });

// db connection
connectDB();


app.listen(port, () => console.log(`Server started on http://localhost:${port}`))