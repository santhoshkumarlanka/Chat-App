import express from "express";
import { checkAuth, login, logout, signup } from "../controllers/auth.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js";
import { updateProfile } from "../controllers/auth.controller.js";
import { authLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();
    

router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

// protectRoute is the middleware that ensures only authenticated users can access the update profile route. It checks for a valid JWT token in the request cookies and verifies it before allowing access to the route handler.

router.put("/update-profile", protectRoute, updateProfile,);

router.get("/check", protectRoute, checkAuth,);

export default router;
