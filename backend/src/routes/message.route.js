import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage, getGroupMessages, sendGroupMessage } from "../controllers/message.controller.js";
import { messageLimiter } from "../middleware/rateLimiter.middleware.js";


const router = express.Router();

router.get("/user",protectRoute,getUsersForSidebar)
router.get("/:id",protectRoute,getMessages);
router.post("/send/:id",protectRoute,messageLimiter,sendMessage);

router.get("/group/:groupId", protectRoute, getGroupMessages);
router.post("/send/group/:groupId", protectRoute, messageLimiter, sendGroupMessage);

export default router;
