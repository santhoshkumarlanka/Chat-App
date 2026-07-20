import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSidebar, getMessages, sendMessage, getGroupMessages, sendGroupMessage } from "../controllers/message.controller.js";


const router = express.Router();

router.get("/user",protectRoute,getUsersForSidebar)
router.get("/:id",protectRoute,getMessages);
router.post("/send/:id",protectRoute,sendMessage);

router.get("/group/:groupId", protectRoute, getGroupMessages);
router.post("/send/group/:groupId", protectRoute, sendGroupMessage);

export default router;
