import express from "express";
import { protectRoute } from "../middleware/auth.js"
import { deleteMessage, getMessages, getUserForSidebar, markMessageAsSeen, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUserForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);
messageRouter.post("/send/:id", protectRoute, sendMessage)
messageRouter.post("/delete", protectRoute, deleteMessage)

export default messageRouter;