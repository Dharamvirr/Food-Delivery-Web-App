import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  foodId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true, default: "Valued Foodie" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
