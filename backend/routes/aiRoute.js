import express from "express";
import { chatWithChef, resumeApproval, seedQdrant } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.post("/chat", chatWithChef);
aiRouter.post("/approve", resumeApproval);
aiRouter.post("/seed", seedQdrant);

export default aiRouter;
