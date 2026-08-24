import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getSmartReplies } from "../controllers/aiController.js";

const aiRouter = express.Router();

// POST because it triggers an AI generation (a side-effect / state change in tokens)
aiRouter.post("/smart-replies/:id", protectRoute, getSmartReplies);

export default aiRouter;
