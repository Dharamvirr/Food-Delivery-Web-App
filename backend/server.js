import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
// index.js or server.js
import dotenv from 'dotenv';
import foodRouter from "./routes/foodRoute.js";
dotenv.config();


// app config
const app = express()
const port = process.env.PORT ;
 


// middlewares
app.use(express.json())
app.use(cors()) // using this we can access any frontend from backend


// db connection
connectDB();

// api endpoints 
app.use("/api/food", foodRouter)
app.use("/images",express.static('uploads'))


app.get("/", (req, res) => {
    res.send("API Working")
  });



app.listen(port, () => console.log(`Server started on http://localhost:${port}`))