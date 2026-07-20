import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createGroup, getGroups, addGroupMembers, leaveGroup } from "../controllers/group.controller.js";

const router = express.Router();

router.post("/", protectRoute, createGroup);
router.get("/", protectRoute, getGroups);
router.post("/:groupId/add", protectRoute, addGroupMembers);
router.post("/:groupId/leave", protectRoute, leaveGroup);

export default router;
