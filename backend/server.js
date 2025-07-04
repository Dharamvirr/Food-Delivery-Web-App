import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
// index.js or server.js
import dotenv from 'dotenv';
dotenv.config();

import foodRouter from "./routes/foodRoute.js";

import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js"


// app config
const app = express()
const port = process.env.PORT ;
 


// middlewares

app.use(express.json())
app.use(cors()) // using this we can access any frontend from backend


// db connection
connectDB();

// api endpoints 
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/cart",cartRouter)

app.use("/api/order",orderRouter)


app.get("/", (req, res) => {
    res.send("API Working")
  });



app.listen(port, () => console.log(`Server started on http://localhost:${port}`))