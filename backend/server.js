import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/reviewRoute.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 4000;

// Setup Socket.IO with CORS for real-time order updates
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Attach io instance to express app so controllers can emit events
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  
  socket.on("join_order_room", (orderId) => {
    if (orderId) {
      socket.join(`order_${orderId}`);
    }
  });

  socket.on("disconnect", () => {
    // Client disconnected
  });
});

// Middlewares
app.use(express.json());
app.use(cors());

// Normalize duplicate slashes in incoming request URLs (e.g. //api/... -> /api/...)
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, "/");
  next();
});

// Database connection
connectDB();

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/review", reviewRouter);

app.get("/", (req, res) => {
  res.send("API Working (WebSockets & Real-time Active)");
});

server.listen(port, () => console.log(`Server started on http://localhost:${port}`));