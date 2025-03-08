import axios from "axios"
import { fileURLToPath } from "url"
import { dirname } from "path"
import dotenv from "dotenv"
import Chat from "../models/Chat.js"

// Load environment variables
dotenv.config()

// Get the directory name
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Check if Together AI API key is available
if (!process.env.TOGETHER_API_KEY) {
  console.error("TOGETHER_API_KEY is missing in environment variables")
}

// Helper function to generate a chat title
const generateChatTitle = async (message) => {
  try {
    if (!process.env.TOGETHER_API_KEY) {
      return "New Conversation"
    }

    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "meta-llama/Llama-3-8b-chat-hf", // Using Llama 3 8B model
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates short, concise titles (3-5 words) for chat conversations based on the first message. The title should reflect the topic or intent of the conversation.",
          },
          { role: "user", content: `Generate a short title for a chat that starts with: "${message}"` },
        ],
        max_tokens: 20,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
      },
    )

    let title = response.data.choices[0].message.content.trim()
    // Remove quotes if present
    title = title.replace(/^["'](.*)["']$/, "$1")
    return title
  } catch (error) {
    console.error("Error generating chat title:", error)
    return "New Conversation"
  }
}

// Helper function to get AI response
const getAIResponse = async (messages) => {
  try {
    if (!process.env.TOGETHER_API_KEY) {
      return "I'm sorry, but the AI service is currently unavailable. Please check back later."
    }

    // Format messages for Together AI
    const formattedMessages = [
      {
        role: "system",
        content: `You are Serenova, an AI mental health companion designed to provide therapy-based conversations and support for personal well-being. 
        
        IMPORTANT GUIDELINES:
        1. Only engage in conversations related to mental health, emotional well-being, personal growth, and therapy.
        2. If asked about topics unrelated to mental health or personal well-being, politely redirect the conversation back to therapeutic topics.
        3. If asked to provide information or perform tasks outside your scope (like coding, math, general knowledge questions), respond with: "I'm designed to support your mental well-being. I'd be happy to discuss how I can help with your emotional health instead."
        4. Never provide medical diagnoses or replace professional medical advice.
        5. Be empathetic, supportive, and non-judgmental in your responses.
        6. Keep responses concise (2-3 paragraphs maximum) but thoughtful.
        7. Use a warm, conversational tone that feels supportive and encouraging.
        
        FORMATTING INSTRUCTIONS:
        - Use **asterisks** for bold text to emphasize important points
        - Use bullet points (•) or numbered lists for structured advice
        - Use separate paragraphs for different thoughts or topics
        - Format lists with proper spacing for readability
        
        Your goal is to help users reflect on their thoughts and feelings, provide emotional support, and suggest evidence-based coping strategies when appropriate.`,
      },
    ]

    // Add user messages
    messages.forEach((msg) => {
      formattedMessages.push({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      })
    })

    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "meta-llama/Llama-3-8b-chat-hf", // Using Llama 3 8B model
        messages: formattedMessages,
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
        },
      },
    )

    return response.data.choices[0].message.content
  } catch (error) {
    console.error("Error getting AI response:", error)
    return "I'm sorry, I'm having trouble processing your request right now. Could you try again in a moment?"
  }
}

// Helper function to convert speech to text using Web Speech API (client-side)
// This is now handled on the client side

// Helper function to convert text to speech using Web Speech API (client-side)
// This is now handled on the client side

// Create a new chat
export const createChat = async (req, res) => {
  try {
    const { userId, message, isVoice, transcription } = req.body

    const messageContent = isVoice ? transcription : message

    if (!messageContent || messageContent.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      })
    }

    // Generate a title for the chat
    const title = await generateChatTitle(messageContent)

    // Create a new chat
    const newChat = new Chat({
      userId,
      title,
      messages: [
        {
          content: messageContent,
          sender: "user",
          isVoice: isVoice,
        },
      ],
    })

    // Get AI response
    const aiResponse = await getAIResponse([{ content: messageContent, sender: "user" }])

    // Add AI response to the chat
    newChat.messages.push({
      content: aiResponse,
      sender: "ai",
    })

    // Save the chat
    await newChat.save()

    res.status(201).json({
      success: true,
      chat: newChat,
    })
  } catch (error) {
    console.error("Error creating chat:", error)
    res.status(500).json({
      success: false,
      message: "Server error while creating chat",
      error: error.message,
    })
  }
}

// Send a message to an existing chat
export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params
    const { message, isVoice, transcription } = req.body

    // Find the chat
    const chat = await Chat.findById(chatId)

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    const messageContent = isVoice ? transcription : message

    if (!messageContent || messageContent.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      })
    }

    // Add user message to the chat
    chat.messages.push({
      content: messageContent,
      sender: "user",
      isVoice: isVoice,
    })

    // Get AI response
    const aiResponse = await getAIResponse(chat.messages)

    // Add AI response to the chat
    chat.messages.push({
      content: aiResponse,
      sender: "ai",
    })

    // Update the chat
    chat.updatedAt = Date.now()
    await chat.save()

    res.status(200).json({
      success: true,
      chat,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({
      success: false,
      message: "Server error while sending message",
      error: error.message,
    })
  }
}

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params

    // Find all chats for the user
    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 })

    // Always return success, even if chats array is empty
    res.status(200).json({
      success: true,
      chats: chats || [], // Ensure we always return an array, even if null/undefined
    })
  } catch (error) {
    console.error("Error getting user chats:", error)
    res.status(500).json({
      success: false,
      message: "Server error while getting user chats",
      error: error.message,
    })
  }
}

// Get a specific chat
export const getChat = async (req, res) => {
  try {
    const { chatId } = req.params

    // Find the chat
    const chat = await Chat.findById(chatId)

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    res.status(200).json({
      success: true,
      chat,
    })
  } catch (error) {
    console.error("Error getting chat:", error)
    res.status(500).json({
      success: false,
      message: "Server error while getting chat",
      error: error.message,
    })
  }
}

// Delete a chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params

    // Find and delete the chat
    const chat = await Chat.findByIdAndDelete(chatId)

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting chat:", error)
    res.status(500).json({
      success: false,
      message: "Server error while deleting chat",
      error: error.message,
    })
  }
}

