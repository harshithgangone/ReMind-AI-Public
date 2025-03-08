import axios from "axios"
import dotenv from "dotenv"
import Call from "../models/Call.js"
import FormData from "form-data"

// Load environment variables
dotenv.config()

// Check if ElevenLabs API key is available
if (!process.env.ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY is missing in environment variables")
}

// Check if Together AI API key is available
if (!process.env.TOGETHER_API_KEY) {
  console.error("TOGETHER_API_KEY is missing in environment variables")
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
        6. Keep responses VERY concise (1-3 sentences maximum) since this is for voice conversation.
        7. Use a warm, conversational tone that feels supportive and encouraging.
        
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
        max_tokens: 150, // Limit tokens for shorter responses
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

// Helper function to convert text to speech using ElevenLabs API
const textToSpeech = async (text) => {
  try {
    if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) {
      console.error("ElevenLabs API key or voice ID is missing")
      return null
    }

    const formData = new FormData()
    formData.append("text", text)
    formData.append("model_id", "eleven_monolingual_v1")
    formData.append("voice_settings", JSON.stringify({ stability: 0.5, similarity_boost: 0.75 }))

    console.log(`Sending TTS request to ElevenLabs for voice ID: ${process.env.ELEVENLABS_VOICE_ID}`)

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVENLABS_VOICE_ID}`,
      formData,
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          ...formData.getHeaders(),
        },
        responseType: "arraybuffer",
      },
    )

    console.log("Received response from ElevenLabs, size:", response.data.length)

    // Convert the audio buffer to base64
    const audioBase64 = Buffer.from(response.data).toString("base64")
    return `data:audio/mpeg;base64,${audioBase64}`
  } catch (error) {
    console.error("Error converting text to speech with ElevenLabs:", error.message)

    // If we have a response with error details
    if (error.response) {
      console.error("ElevenLabs API error status:", error.response.status)
      console.error(
        "ElevenLabs API error data:",
        error.response.data instanceof Buffer ? error.response.data.toString() : error.response.data,
      )
    }

    // Use a fallback TTS service
    try {
      console.log("Attempting to use fallback TTS service")
      const encodedText = encodeURIComponent(text)
      const fallbackResponse = await axios.get(
        `https://api.voicerss.org/?key=2b530fee16b24537a1c50af9c0be2a3f&hl=en-us&v=Mary&c=MP3&f=16khz_16bit_stereo&src=${encodedText}`,
        { responseType: "arraybuffer" },
      )

      const fallbackAudioBase64 = Buffer.from(fallbackResponse.data).toString("base64")
      console.log("Fallback TTS successful")
      return `data:audio/mpeg;base64,${fallbackAudioBase64}`
    } catch (fallbackError) {
      console.error("Fallback TTS service also failed:", fallbackError.message)
      return null
    }
  }
}

// Start a new call
export const startCall = async (req, res) => {
  try {
    const { userId } = req.body

    // Create a new call
    const newCall = new Call({
      userId,
      title: "Voice Call",
      messages: [],
    })

    // Save the call
    await newCall.save()

    res.status(201).json({
      success: true,
      call: newCall,
    })
  } catch (error) {
    console.error("Error starting call:", error)
    res.status(500).json({
      success: false,
      message: "Server error while starting call",
      error: error.message,
    })
  }
}

// Send a voice message
export const sendVoiceMessage = async (req, res) => {
  try {
    const { callId } = req.params
    const { transcription } = req.body

    if (!transcription || transcription.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Transcription is required",
      })
    }

    // Find the call
    const call = await Call.findById(callId)

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      })
    }

    // Add user message to the call
    call.messages.push({
      content: transcription,
      sender: "user",
    })

    // Get AI response
    const aiResponse = await getAIResponse(call.messages)

    // Convert AI response to speech
    const audioUrl = await textToSpeech(aiResponse)

    // Add AI response to the call
    call.messages.push({
      content: aiResponse,
      sender: "ai",
      audioUrl: audioUrl,
    })

    // Update the call
    call.updatedAt = Date.now()
    await call.save()

    res.status(200).json({
      success: true,
      message: {
        content: aiResponse,
        audioUrl: audioUrl,
      },
      call,
    })
  } catch (error) {
    console.error("Error sending voice message:", error)
    res.status(500).json({
      success: false,
      message: "Server error while sending voice message",
      error: error.message,
    })
  }
}

// Get all calls for a user
export const getUserCalls = async (req, res) => {
  try {
    const { userId } = req.params

    // Find all calls for the user
    const calls = await Call.find({ userId }).sort({ updatedAt: -1 })

    res.status(200).json({
      success: true,
      calls: calls || [],
    })
  } catch (error) {
    console.error("Error getting user calls:", error)
    res.status(500).json({
      success: false,
      message: "Server error while getting user calls",
      error: error.message,
    })
  }
}

// Get a specific call
export const getCall = async (req, res) => {
  try {
    const { callId } = req.params

    // Find the call
    const call = await Call.findById(callId)

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      })
    }

    res.status(200).json({
      success: true,
      call,
    })
  } catch (error) {
    console.error("Error getting call:", error)
    res.status(500).json({
      success: false,
      message: "Server error while getting call",
      error: error.message,
    })
  }
}

// End a call
export const endCall = async (req, res) => {
  try {
    const { callId } = req.params

    // Find the call
    const call = await Call.findById(callId)

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      })
    }

    // Update the call status
    call.status = "ended"
    call.endedAt = Date.now()
    await call.save()

    res.status(200).json({
      success: true,
      message: "Call ended successfully",
      call,
    })
  } catch (error) {
    console.error("Error ending call:", error)
    res.status(500).json({
      success: false,
      message: "Server error while ending call",
      error: error.message,
    })
  }
}

// Delete a call
export const deleteCall = async (req, res) => {
  try {
    const { callId } = req.params

    // Find and delete the call
    const call = await Call.findByIdAndDelete(callId)

    if (!call) {
      return res.status(404).json({
        success: false,
        message: "Call not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Call deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting call:", error)
    res.status(500).json({
      success: false,
      message: "Server error while deleting call",
      error: error.message,
    })
  }
}

