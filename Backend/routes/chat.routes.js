import express from "express"
import { createChat, sendMessage, getUserChats, getChat, deleteChat } from "../controllers/chat.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

// Create a new chat
router.post("/", verifyToken, createChat)

// Send a message to an existing chat
router.post("/:chatId/messages", verifyToken, sendMessage)

// Get all chats for a user
router.get("/user/:userId", verifyToken, getUserChats)

// Get a specific chat
router.get("/:chatId", verifyToken, getChat)

// Delete a chat
router.delete("/:chatId", verifyToken, deleteChat)

export default router

