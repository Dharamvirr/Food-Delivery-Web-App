import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

// Add new review for a food item
const addReview = async (req, res) => {
  const userId = req.userId || req.body.userId;
  const { foodId, rating, comment } = req.body;

  if (!foodId) {
    return res.json({ success: false, message: "Food item ID is required" });
  }

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    return res.json({ success: false, message: "Please select a valid star rating (1 to 5)" });
  }

  if (!comment || comment.trim().length === 0) {
    return res.json({ success: false, message: "Please write a brief comment sharing your experience" });
  }

  try {
    const user = await userModel.findById(userId);
    const userName = user ? user.name : "Valued Foodie";

    const newReview = new reviewModel({
      foodId: String(foodId),
      userId,
      userName,
      rating: numRating,
      comment: comment.trim(),
    });

    const savedReview = await newReview.save();

    // Recalculate stats for the food item
    const allReviews = await reviewModel.find({ foodId: String(foodId) });
    const totalReviews = allReviews.length;
    const averageRating = Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1));

    res.json({
      success: true,
      message: "Thank you for reviewing! Your feedback is live ⭐",
      review: savedReview,
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.json({ success: false, message: "Failed to submit review" });
  }
};

// Get reviews and aggregate rating for a food item
const getReviews = async (req, res) => {
  const foodId = req.params.foodId || req.query.foodId;

  if (!foodId) {
    return res.json({ success: false, message: "Food item ID is required" });
  }

  try {
    const reviews = await reviewModel.find({ foodId: String(foodId) }).sort({ createdAt: -1 });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 4.8; // Warm default baseline if newly added

    res.json({
      success: true,
      reviews,
      averageRating,
      totalReviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.json({ success: false, message: "Failed to fetch reviews" });
  }
};

export { addReview, getReviews };
