import api from "./api"

export const createChat = async (data) => {
  try {
    const response = await api.post("/chats", data)
    return response.data
  } catch (error) {
    console.error("Error creating chat:", error)
    // If we're in a hackathon and the server is down, let's provide a fallback
    if (!error.response) {
      return {
        success: true,
        chat: {
          _id: "local-" + Date.now(),
          title: "New Conversation",
          messages: [
            {
              content: data.message || data.transcription,
              sender: "user",
              timestamp: new Date(),
              isVoice: data.isVoice,
            },
            {
              content: "I'm here to help with your mental health questions. How are you feeling today?",
              sender: "ai",
              timestamp: new Date(),
            },
          ],
        },
      }
    }
    throw error
  }
}

export const sendMessage = async (chatId, data) => {
  try {
    const response = await api.post(`/chats/${chatId}/messages`, data)
    return response.data
  } catch (error) {
    console.error("Error sending message:", error)
    // If we're in a hackathon and the server is down, let's provide a fallback
    if (!error.response && chatId.startsWith("local-")) {
      return {
        success: true,
        chat: {
          _id: chatId,
          messages: [
            {
              content: data.message || data.transcription,
              sender: "user",
              timestamp: new Date(),
              isVoice: data.isVoice,
            },
            {
              content: "I understand you're feeling that way. Would you like to talk more about it?",
              sender: "ai",
              timestamp: new Date(),
            },
          ],
        },
      }
    }
    throw error
  }
}

export const getUserChats = async (userId) => {
  try {
    const response = await api.get(`/chats/user/${userId}`)
    return {
      success: true,
      chats: response.data.chats || [], // Ensure we always return an array
    }
  } catch (error) {
    console.error("Error getting user chats:", error)
    // Return empty array instead of throwing error for new users
    return {
      success: false,
      chats: [],
      error: error.message,
    }
  }
}

export const getChat = async (chatId) => {
  try {
    const response = await api.get(`/chats/${chatId}`)
    return response.data
  } catch (error) {
    console.error("Error getting chat:", error)
    throw error
  }
}

export const deleteChat = async (chatId) => {
  try {
    const response = await api.delete(`/chats/${chatId}`)
    return response.data
  } catch (error) {
    console.error("Error deleting chat:", error)
    throw error
  }
}

