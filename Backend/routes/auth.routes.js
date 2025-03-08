import express from "express"
import { verifyUser, updateOnboarding, logout } from "../controllers/auth.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

// Verify user and check if they exist in MongoDB
router.get("/verify", verifyToken, verifyUser)

// Update user onboarding information
router.post("/onboarding", verifyToken, updateOnboarding)

// Logout user
router.post("/logout", verifyToken, logout)

export default router

