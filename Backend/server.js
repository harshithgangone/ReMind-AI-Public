// Load environment variables first
import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import userRoutes from "./routes/userRoutes.js"
import chatRoutes from "./routes/chat.routes.js"
import callRoutes from "./routes/call.routes.js" // Import call routes
import http from "http"
import { Server } from "socket.io"
import path from "path"
import { fileURLToPath  } from "url"
import { dirname } from "path"
import { getFirebaseAdmin } from "./config/firebase.config.js"

// Log environment variables (without sensitive values)
console.log("Environment variables loaded:")
console.log("TOGETHER_API_KEY exists:", !!process.env.TOGETHER_API_KEY)
console.log("ELEVENLABS_API_KEY exists:", !!process.env.ELEVENLABS_API_KEY)
console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI)

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get Firebase Admin instance
const firebaseAdminInstance = getFirebaseAdmin()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000

// Create HTTP server
const server = http.createServer(app)

// Get client URL from environment or use a wildcard for development
const clientURL = process.env.FRONTEND_URL || "*"
console.log("Allowing CORS for:", clientURL)

// Initialize Socket.io with proper CORS settings
const io = new Server(server, {
  cors: {
    origin: clientURL,
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Middleware
app.use(
  cors({
    origin: clientURL,
    credentials: true,
  }),
)
app.use(express.json({ limit: "50mb" })) // Increase limit for audio data

// Serve static files
app.use("/audio", express.static(path.join(__dirname, "public/audio")))

// Auth middleware
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    })
  }

  const token = authHeader.split(" ")[1]

  try {
    const decodedToken = await firebaseAdminInstance.auth().verifyIdToken(token)
    req.user = decodedToken
    next()
  } catch (error) {
    console.error("Token verification error:", error)
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    })
  }
}

// Routes
app.use("/api/users", verifyToken, userRoutes)
app.use("/api/chats", chatRoutes)
app.use("/api/calls", callRoutes) // Register call routes

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Debug route to check if call routes are registered
app.get("/api/debug/routes", (req, res) => {
  const routes = []
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      })
    } else if (middleware.name === "router") {
      // Routes registered via router
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods),
            baseUrl: middleware.regexp.toString(),
          })
        }
      })
    }
  })
  res.json(routes)
})

// Socket.io connection
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id)

  // Join a chat room
  socket.on("join-chat", (chatId) => {
    socket.join(chatId)
    console.log(`Client ${socket.id} joined chat: ${chatId}`)
  })

  // Join a call room
  socket.on("join-call", (callId) => {
    socket.join(callId)
    console.log(`Client ${socket.id} joined call: ${callId}`)
    // Notify other clients in the room
    socket.to(callId).emit("user-joined", { userId: socket.id })
  })

  // Leave a chat room
  socket.on("leave-chat", (chatId) => {
    socket.leave(chatId)
    console.log(`Client ${socket.id} left chat: ${chatId}`)
  })

  // Leave a call room
  socket.on("leave-call", (callId) => {
    socket.leave(callId)
    console.log(`Client ${socket.id} left call: ${callId}`)
    // Notify other clients in the room
    socket.to(callId).emit("user-left", { userId: socket.id })
  })

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Export io for use in other files
export { io }

