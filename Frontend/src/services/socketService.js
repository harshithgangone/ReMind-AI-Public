import { io } from "socket.io-client"

let socket = null
let connectionAttempts = 0
const MAX_RECONNECTION_ATTEMPTS = 3

export const initSocket = () => {
  if (!socket) {
    const serverUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000"
    console.log("Connecting to socket server at:", serverUrl)

    try {
      socket = io(serverUrl, {
        transports: ["websocket", "polling"],
        reconnectionAttempts: MAX_RECONNECTION_ATTEMPTS,
        reconnectionDelay: 1000,
        timeout: 10000,
      })

      socket.on("connect", () => {
        console.log("Connected to socket server with ID:", socket.id)
        connectionAttempts = 0 // Reset connection attempts on successful connection
      })

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message)
        connectionAttempts++

        if (connectionAttempts >= MAX_RECONNECTION_ATTEMPTS) {
          console.warn(`Failed to connect after ${MAX_RECONNECTION_ATTEMPTS} attempts. Using offline mode.`)
          // Don't disconnect here, let the socket continue trying in the background
        }
      })

      socket.on("disconnect", () => {
        console.log("Disconnected from socket server")
      })
    } catch (error) {
      console.error("Error initializing socket:", error)
      return null
    }
  }

  return socket
}

export const joinChat = (chatId) => {
  if (!chatId) return

  if (socket && socket.connected) {
    console.log("Joining chat:", chatId)
    socket.emit("join-chat", chatId)
  } else {
    console.warn("Socket not connected, can't join chat:", chatId)
  }
}

export const joinCall = (callId) => {
  if (!callId) return

  if (socket && socket.connected) {
    console.log("Joining call:", callId)
    socket.emit("join-call", callId)
  } else {
    console.warn("Socket not connected, can't join call:", callId)
    // Try to reconnect
    if (socket) {
      socket.connect()
    } else {
      initSocket()
    }
  }
}

export const leaveChat = (chatId) => {
  if (!chatId) return

  if (socket && socket.connected) {
    console.log("Leaving chat:", chatId)
    socket.emit("leave-chat", chatId)
  }
}

export const leaveCall = (callId) => {
  if (!callId) return

  if (socket && socket.connected) {
    console.log("Leaving call:", callId)
    socket.emit("leave-call", callId)
  }
}

export const disconnectSocket = () => {
  if (socket) {
    console.log("Disconnecting socket")
    socket.disconnect()
    socket = null
  }
}

// Function to check if socket is connected
export const isSocketConnected = () => {
  return socket && socket.connected
}

// Function to force reconnect
export const forceReconnect = () => {
  if (socket) {
    socket.disconnect()
    socket.connect()
    return true
  }
  return false
}

