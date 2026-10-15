import express from 'express';
import { addReview, getReviews } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/auth.js';

const reviewRouter = express.Router();

// Public: Fetch reviews and score for a dish
reviewRouter.get("/:foodId", getReviews);

// Protected: Submit diner review
reviewRouter.post("/add", authMiddleware, addReview);

export default reviewRouter;
