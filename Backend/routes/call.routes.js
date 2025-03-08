import express from "express"
import {
  startCall,
  sendVoiceMessage,
  getUserCalls,
  getCall,
  endCall,
  deleteCall,
} from "../controllers/call.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

// Start a new call
router.post("/", verifyToken, startCall)

// Send a voice message
router.post("/:callId/messages", verifyToken, sendVoiceMessage)

// Get all calls for a user
router.get("/user/:userId", verifyToken, getUserCalls)

// Get a specific call
router.get("/:callId", verifyToken, getCall)

// End a call
router.put("/:callId/end", verifyToken, endCall)

// Delete a call
router.delete("/:callId", verifyToken, deleteCall)

export default router

