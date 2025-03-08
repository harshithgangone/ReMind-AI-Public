import express from "express"
import { getUserProfile, updateUserPreferences } from "../controllers/user.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

// Get user profile
router.get("/profile", verifyToken, getUserProfile)

// Update user preferences
router.put("/preferences", verifyToken, updateUserPreferences)

export default router

