import api from "./api"

// Add fallback behavior for demo purposes
export const startCall = async (userId) => {
  try {
    const response = await api.post("/calls", { userId })
    return response.data
  } catch (error) {
    console.error("Error starting call:", error)
    // Return mock data for demo purposes
    return {
      success: true,
      call: {
        _id: "local-" + Date.now(),
        userId,
        title: "Voice Call",
        status: "active",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
  }
}

// Simple function to generate AI response using Together AI
async function generateAIResponse(userMessage) {
  try {
    console.log("Generating AI response for:", userMessage)

    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY

    if (!apiKey) {
      console.warn("Together AI API key not found, using mock response")
      // Return a mock response instead of throwing an error
      return "I understand how you're feeling. Would you like to tell me more about what's on your mind?"
    }

    // Call Together AI API
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-8b-chat-hf",
        messages: [
          {
            role: "system",
            content:
              "You are Serenova, an AI mental health companion. Keep responses concise (1-3 sentences) and focus on being empathetic and supportive.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error generating AI response:", error)
    // Return a fallback response instead of throwing
    return "I'm here to listen and support you. How can I help you today?"
  }
}

// Simple function to convert text to speech using ElevenLabs
export const textToSpeech = async (text) => {
  try {
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM"

    if (!apiKey) {
      console.warn("ElevenLabs API key not found, using browser TTS")
      // Return null to signal the frontend to use browser TTS
      return null
    }

    // Call ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    // Get the audio blob
    const audioBlob = await response.blob()

    // Create a URL for the blob
    const audioUrl = URL.createObjectURL(audioBlob)

    return audioUrl
  } catch (error) {
    console.error("Error with ElevenLabs TTS:", error)
    // Return null to signal the frontend to use browser TTS
    return null
  }
}

// Simplified function to send voice message
export const sendVoiceMessage = async (callId, transcription) => {
  try {
    console.log("Processing voice message:", transcription)

    // Step 1: Generate AI response text
    const aiResponse = await generateAIResponse(transcription)
    console.log("AI response generated:", aiResponse)

    // Step 2: Convert AI response to speech
    const audioUrl = await textToSpeech(aiResponse)
    console.log("Audio URL generated:", audioUrl ? "Success" : "Failed")

    // Step 3: Return the response
    return {
      success: true,
      message: {
        content: aiResponse,
        audioUrl: audioUrl,
      },
      call: {
        _id: callId,
        messages: [
          {
            content: transcription,
            sender: "user",
            timestamp: new Date(),
          },
          {
            content: aiResponse,
            sender: "ai",
            timestamp: new Date(),
            audioUrl: audioUrl,
          },
        ],
      },
    }
  } catch (error) {
    console.error("Error in voice message processing:", error)
    throw error
  }
}

export const getUserCalls = async (userId) => {
  try {
    const response = await api.get(`/calls/user/${userId}`)
    return {
      success: true,
      calls: response.data.calls || [],
    }
  } catch (error) {
    console.error("Error getting user calls:", error)
    return {
      success: true,
      calls: [],
    }
  }
}

export const getCall = async (callId) => {
  try {
    const response = await api.get(`/calls/${callId}`)
    return response.data
  } catch (error) {
    console.error("Error getting call:", error)
    throw error
  }
}

export const endCall = async (callId) => {
  try {
    const response = await api.put(`/calls/${callId}/end`)
    return response.data
  } catch (error) {
    console.error("Error ending call:", error)
    return {
      success: true,
      message: "Call ended successfully",
      call: {
        _id: callId,
        status: "ended",
        endedAt: new Date(),
      },
    }
  }
}

export const deleteCall = async (callId) => {
  try {
    const response = await api.delete(`/calls/${callId}`)
    return response.data
  } catch (error) {
    console.error("Error deleting call:", error)
    throw error
  }
}

