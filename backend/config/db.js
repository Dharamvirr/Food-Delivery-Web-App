import mongoose from "mongoose";
import dns from "node:dns";

export const connectDB = async () => {
  try {
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (e) {
      // ignore if not supported in environment
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ DB Connected");
  } catch (error) {
    console.error("❌ DB Connection Error:", error.message);
    process.exit(1);
  }
};
