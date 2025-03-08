"use client"

import { useState, useRef, useEffect } from "react"
import {
  Box,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Avatar,
  useTheme,
  ListItemButton,
  ListItemAvatar,
  Grid,
  Fab,
  GlobalStyles,
  Chip,
  CircularProgress,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import Logo from "../components/Logo"
import FloatingObjects from "../components/FloatingObjects"
import { useThemeContext } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useSnackbar } from "notistack"
import { startCall, sendVoiceMessage, getUserCalls, endCall } from "../services/callService"
import { initSocket, joinCall, leaveCall, disconnectSocket } from "../services/socketService"

// Icons
import MenuIcon from "@mui/icons-material/Menu"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import SettingsIcon from "@mui/icons-material/Settings"
import LogoutIcon from "@mui/icons-material/Logout"
import HomeIcon from "@mui/icons-material/Home"
import HistoryIcon from "@mui/icons-material/History"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import CallEndIcon from "@mui/icons-material/CallEnd"
import MicIcon from "@mui/icons-material/Mic"
import MicOffIcon from "@mui/icons-material/MicOff"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import VolumeOffIcon from "@mui/icons-material/VolumeOff"
import InfoIcon from "@mui/icons-material/Info"

// Define global styles using MUI's GlobalStyles component
const globalStyles = {
  "@keyframes pulse": {
    "0%": { transform: "scale(1)", opacity: 0.8 },
    "50%": { transform: "scale(1.05)", opacity: 1 },
    "100%": { transform: "scale(1)", opacity: 0.8 },
  },
  "@keyframes fadeIn": {
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
}

const CallPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { toggleTheme, mode } = useThemeContext()
  const theme = useTheme()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [callStatus, setCallStatus] = useState("connecting") // connecting, active, ended
  const [isMuted, setIsMuted] = useState(false)
  const [isSpeakerOn, setIsSpeakerOn] = useState(true)
  const [callDuration, setCallDuration] = useState(0)
  const [callHistory, setCallHistory] = useState([])
  const [currentCallId, setCurrentCallId] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [messages, setMessages] = useState([])
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [recognition, setRecognition] = useState(useState(null))
  const [isRecording, setIsRecording] = useState(false)

  const audioRef = useRef(null)
  const socket = useRef(null)
  const messagesEndRef = useRef(null)

  // Initialize socket
  useEffect(() => {
    try {
      socket.current = initSocket()
    } catch (error) {
      console.error("Failed to initialize socket:", error)
    }

    return () => {
      disconnectSocket()
    }
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (SpeechRecognition) {
      try {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"

        recognitionInstance.onresult = (event) => {
          if (isAiSpeaking) return // Ignore results if AI is speaking

          let interimTranscript = ""
          let finalTranscript = ""

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + " "
            } else {
              interimTranscript += transcript
            }
          }

          const currentTranscript = finalTranscript || interimTranscript
          setTranscript(currentTranscript)
        }

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error", event.error)

          // Don't show error for aborted recognition (happens normally when stopping)
          if (event.error !== "aborted") {
            enqueueSnackbar(`Speech recognition error: ${event.error}. Try using Chrome browser for best results.`, {
              variant: "error",
            })
          }

          setIsRecording(false)
        }

        recognitionInstance.onend = () => {
          console.log("Speech recognition ended")

          // Only restart if we're still in recording mode and not processing
          if (isRecording && !isProcessing && !isAiSpeaking && callStatus === "active") {
            // Add a small delay before restarting to avoid "already started" errors
            setTimeout(() => {
              try {
                recognitionInstance.start()
                console.log("Recognition restarted")
              } catch (error) {
                console.error("Error restarting recognition:", error)
              }
            }, 300)
          }
        }

        setRecognition(recognitionInstance)
      } catch (error) {
        console.error("Error initializing speech recognition:", error)
        enqueueSnackbar("Failed to initialize speech recognition. Try using Chrome browser.", { variant: "error" })
      }
    } else {
      enqueueSnackbar("Speech recognition is not supported in your browser. Please use Chrome for this feature.", {
        variant: "warning",
      })
    }

    return () => {
      if (recognition) {
        recognition.onend = null
        recognition.onresult = null
        recognition.onerror = null
        if (isRecording) {
          try {
            recognition.stop()
          } catch (error) {
            console.error("Error stopping recognition:", error)
          }
        }
      }
    }
  }, [isAiSpeaking, isProcessing, callStatus])

  // Load call history
  useEffect(() => {
    if (currentUser) {
      loadCallHistory()
    }
  }, [currentUser])

  // Start a new call when the component mounts
  useEffect(() => {
    if (currentUser && callStatus === "connecting") {
      handleStartCall()
    }
  }, [currentUser])

  // Join call room when currentCallId changes
  useEffect(() => {
    if (currentCallId) {
      joinCall(currentCallId)
    }

    return () => {
      if (currentCallId) {
        leaveCall(currentCallId)
      }
    }
  }, [currentCallId])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle call duration timer
  useEffect(() => {
    let timer
    if (callStatus === "active") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [callStatus])

  // Handle speech recognition based on call status and AI speaking status
  useEffect(() => {
    // Only attempt to start/stop recognition if we have a recognition instance
    if (!recognition) return

    // Define a safe way to start recognition with error handling
    const safeStartRecognition = () => {
      if (!isRecording) {
        try {
          // Add a small delay to avoid "already started" errors
          setTimeout(() => {
            recognition.start()
            setIsRecording(true)
            console.log("Started speech recognition automatically")
          }, 300)
        } catch (error) {
          console.error("Error starting speech recognition:", error)
          setIsRecording(false)
        }
      }
    }

    // Define a safe way to stop recognition with error handling
    const safeStopRecognition = () => {
      if (isRecording) {
        try {
          recognition.stop()
          setIsRecording(false)
          console.log("Stopped speech recognition automatically")
        } catch (error) {
          console.error("Error stopping speech recognition:", error)
        }
      }
    }

    // Logic for when to start/stop recognition
    if (callStatus === "active" && !isAiSpeaking && !isProcessing && !isRecording) {
      // Start recording if call is active, AI is not speaking, and we're not already recording
      safeStartRecognition()
    } else if ((callStatus !== "active" || isAiSpeaking || isProcessing) && isRecording) {
      // Stop recording if call is not active, AI is speaking, or we're processing
      safeStopRecognition()
    }
  }, [callStatus, isAiSpeaking, isProcessing, isRecording, recognition])

  // Process transcript when it changes and is not empty
  useEffect(() => {
    const processTranscript = async () => {
      // Only process if we have a transcript, we're not already processing, AI is not speaking, and call is active
      if (
        transcript.trim() !== "" &&
        !isProcessing &&
        !isAiSpeaking &&
        callStatus === "active" &&
        transcript.trim().length > 10 // Only process if transcript is substantial
      ) {
        try {
          setIsProcessing(true)

          // Stop recognition while processing
          if (recognition && isRecording) {
            try {
              recognition.stop()
              setIsRecording(false)
            } catch (error) {
              console.error("Error stopping recognition during processing:", error)
            }
          }

          // Add user message to UI
          const userMessage = {
            content: transcript,
            sender: "user",
            timestamp: new Date(),
          }
          setMessages((prev) => [...prev, userMessage])

          // Clear transcript
          setTranscript("")

          // Send to server
          console.log("Sending voice message to server")
          const response = await sendVoiceMessage(currentCallId, transcript)

          // Add AI response to UI
          const aiMessage = {
            content: response.message.content,
            sender: "ai",
            timestamp: new Date(),
            audioUrl: response.message.audioUrl,
          }
          setMessages((prev) => [...prev, aiMessage])

          // Play audio response
          if (aiMessage.audioUrl && isSpeakerOn) {
            setIsAiSpeaking(true)

            if (audioRef.current) {
              // Clean up any previous blob URL
              if (audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
                URL.revokeObjectURL(audioRef.current.src)
              }

              // Make sure any previous audio is stopped
              audioRef.current.pause()
              audioRef.current.currentTime = 0

              // Now set the source and play
              audioRef.current.src = aiMessage.audioUrl

              // Use a promise to handle play() which returns a promise
              try {
                await audioRef.current.play()
                console.log("Audio playback started successfully")
              } catch (error) {
                console.error("Error playing audio:", error)
                enqueueSnackbar("Could not play audio response. Using fallback TTS.", {
                  variant: "warning",
                })

                // Use browser's built-in speech synthesis as fallback
                if ("speechSynthesis" in window) {
                  // Make sure we're not already speaking
                  speechSynthesis.cancel()

                  const utterance = new SpeechSynthesisUtterance(aiMessage.content)
                  utterance.onend = () => {
                    setIsAiSpeaking(false)
                    // Restart recognition after speech is done
                    if (callStatus === "active" && !isRecording) {
                      setTimeout(() => {
                        try {
                          setIsRecording(true)
                          recognition.start()
                        } catch (error) {
                          console.error("Error restarting recognition:", error)
                        }
                      }, 500)
                    }
                  }
                  setIsAiSpeaking(true)
                  speechSynthesis.speak(utterance)
                } else {
                  setIsAiSpeaking(false)
                }
              }
            } else {
              console.error("Audio reference is not available")
              setIsAiSpeaking(false)
            }
          } else {
            setIsAiSpeaking(false)
          }
        } catch (error) {
          console.error("Error processing transcript:", error)
          enqueueSnackbar("Error processing your message", { variant: "error" })
          setIsAiSpeaking(false)
        } finally {
          setIsProcessing(false)
        }
      }
    }

    // Debounce the transcript processing
    const timeoutId = setTimeout(() => {
      processTranscript()
    }, 1500) // Wait 1.5 seconds after last transcript change

    return () => clearTimeout(timeoutId)
  }, [transcript, isProcessing, isAiSpeaking, callStatus])

  // Load call history
  useEffect(() => {
    if (currentUser) {
      loadCallHistory()
    }
  }, [currentUser])

  // Start a new call when the component mounts
  useEffect(() => {
    if (currentUser && callStatus === "connecting") {
      handleStartCall()
    }
  }, [currentUser])

  // Join call room when currentCallId changes
  useEffect(() => {
    if (currentCallId) {
      joinCall(currentCallId)
    }

    return () => {
      if (currentCallId) {
        leaveCall(currentCallId)
      }
    }
  }, [currentCallId])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle call duration timer
  useEffect(() => {
    let timer
    if (callStatus === "active") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [callStatus])

  // Add a cleanup function to the useEffect for audio
  useEffect(() => {
    // Cleanup function for audio
    return () => {
      if (audioRef.current) {
        // Clean up the audio URL if it's a blob URL
        if (audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
          URL.revokeObjectURL(audioRef.current.src)
        }

        audioRef.current.pause()
        audioRef.current.src = ""
      }

      // Also cancel any speech synthesis that might be playing
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel()
      }

      setIsAiSpeaking(false)
    }
  }, [])

  // Update the handleEndCall function to properly clean up audio
  const handleEndCall = async () => {
    try {
      // Stop recording
      if (recognition && isRecording) {
        recognition.stop()
        setIsRecording(false)
      }

      // Stop audio playback
      if (audioRef.current) {
        // Clean up the audio URL if it's a blob URL
        if (audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
          URL.revokeObjectURL(audioRef.current.src)
        }

        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Also cancel any speech synthesis that might be playing
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel()
      }

      setCallStatus("ended")
      setIsAiSpeaking(false)

      if (currentCallId) {
        await endCall(currentCallId)
        enqueueSnackbar("Call ended successfully", { variant: "success" })
      }

      // Reload call history
      loadCallHistory()

      // Navigate back to home after a delay
      setTimeout(() => {
        navigate("/home")
      }, 2000)
    } catch (error) {
      console.error("Error ending call:", error)
      enqueueSnackbar("Failed to end call", { variant: "error" })

      // Still navigate back even if there's an error
      setTimeout(() => {
        navigate("/home")
      }, 2000)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)

    // If unmuting and call is active, restart recognition
    if (isMuted && callStatus === "active" && !isAiSpeaking && !isProcessing && recognition && !isRecording) {
      try {
        setIsRecording(true)
        recognition.start()
        console.log("Started recognition after unmuting")
      } catch (error) {
        console.error("Error starting recognition after unmuting:", error)
      }
    }

    // If muting, stop recognition
    if (!isMuted && isRecording && recognition) {
      try {
        recognition.stop()
        setIsRecording(false)
        console.log("Stopped recognition after muting")
      } catch (error) {
        console.error("Error stopping recognition after muting:", error)
      }
    }
  }

  // Update the toggleSpeaker function to properly handle audio
  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn)

    // If turning speaker off while AI is speaking, stop audio
    if (isSpeakerOn && isAiSpeaking) {
      if (audioRef.current) {
        // Clean up the audio URL if it's a blob URL
        if (audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
          URL.revokeObjectURL(audioRef.current.src)
        }

        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Also cancel any speech synthesis that might be playing
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel()
      }

      setIsAiSpeaking(false)

      // Restart recognition if needed
      if (callStatus === "active" && !isRecording && recognition) {
        try {
          setIsRecording(true)
          recognition.start()
          console.log("Restarted recognition after stopping audio")
        } catch (error) {
          console.error("Error restarting recognition:", error)
        }
      }
    }
  }

  const toggleDrawer = (open) => (event) => {
    if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setDrawerOpen(open)
  }

  const goBack = () => {
    // End call before navigating back
    handleEndCall()
  }

  const handleLogout = async () => {
    try {
      // End call before logging out
      if (callStatus === "active") {
        await endCall(currentCallId)
      }

      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
      navigate("/")
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()

    // If it's today, show the time
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    // If it's yesterday, show "Yesterday"
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    }

    // Otherwise, show the date
    return date.toLocaleDateString()
  }

  // Fix the loadCallHistory function to ensure callHistory is always an array
  const loadCallHistory = async () => {
    try {
      const response = await getUserCalls(currentUser.uid)
      // Make sure we're setting an array
      setCallHistory(response.calls || [])
    } catch (error) {
      console.error("Error loading call history:", error)
      enqueueSnackbar("Failed to load call history", { variant: "error" })
      // Set an empty array on error
      setCallHistory([])
    }
  }

  const handleStartCall = async () => {
    try {
      setIsProcessing(true)
      const callDetails = await startCall(currentUser.uid)
      setCurrentCallId(callDetails.callId)
      setCallStatus("active")
      enqueueSnackbar("Call started successfully", { variant: "success" })
    } catch (error) {
      console.error("Error starting call:", error)
      enqueueSnackbar("Failed to start call", { variant: "error" })
      setCallStatus("ended")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      {/* Add global styles using MUI's GlobalStyles component */}
      <GlobalStyles styles={globalStyles} />
      <FloatingObjects />
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: "blur(10px)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Logo disableClick={true} />
            <Chip
              label="BETA"
              color="secondary"
              size="small"
              sx={{
                ml: 1,
                fontWeight: "bold",
                animation: "pulse 2s infinite",
              }}
            />
          </Box>

          <Box>
            <IconButton onClick={goBack} color="inherit" sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 280,
            background: (theme) =>
              theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.95)" : "rgba(230, 235, 242, 0.95)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Logo disableClick={true} />
        </Box>
        <Divider />

        <List>
          <ListItem>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemButton onClick={() => navigate("/home")}>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary="Call History" />
          </ListItem>
        </List>

        {/* Also update the List rendering to check if callHistory exists and is an array */}
        <List sx={{ maxHeight: "40vh", overflow: "auto" }}>
          {Array.isArray(callHistory) && callHistory.length > 0 ? (
            callHistory.map((call) => (
              <ListItem key={call._id} sx={{ pl: 4 }}>
                <ListItemButton>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <Typography variant="caption">{call._id ? call._id.substring(0, 2) : "?"}</Typography>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={call.title}
                    secondary={`${formatDate(call.createdAt)} • ${call.messages ? call.messages.length : 0} messages`}
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <Box sx={{ p: 2, textAlign: "center", width: "100%" }}>
                <Typography variant="body2" color="text.secondary">
                  No call history yet.
                </Typography>
              </Box>
            </ListItem>
          )}
        </List>

        <Divider />
        <List>
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText
              primary="Voice Call BETA"
              secondary="All calls are stored as text for your reference"
              primaryTypographyProps={{ variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemButton>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Toolbar /> {/* Spacer for fixed AppBar */}
      {/* Call Interface */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 4,
            width: "100%",
            maxWidth: 500,
            textAlign: "center",
            backdropFilter: "blur(10px)",
            background: (theme) =>
              theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.8)" : "rgba(230, 235, 242, 0.8)",
          }}
        >
          <Avatar
            sx={{
              width: 120,
              height: 120,
              mx: "auto",
              mb: 3,
              bgcolor: theme.palette.primary.main,
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
              animation: callStatus === "connecting" || isAiSpeaking ? "pulse 1.5s infinite" : "none",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 200 }}>
              S
            </Typography>
          </Avatar>

          <Typography variant="h4" sx={{ mb: 1, fontWeight: 300 }}>
            <span style={{ fontWeight: 200 }}>Serenova</span>
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {callStatus === "connecting" && "Connecting..."}
            {callStatus === "active" && `Call in progress • ${formatTime(callDuration)}`}
            {callStatus === "ended" && "Call ended"}
          </Typography>

          {/* Transcript display */}
          {callStatus === "active" && (
            <Box sx={{ mb: 4, maxHeight: 150, overflowY: "auto" }}>
              {isProcessing && (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              )}

              {isAiSpeaking ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", animation: "fadeIn 0.5s" }}
                >
                  Serenova is speaking...
                </Typography>
              ) : isRecording ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  {transcript ? transcript : "Listening..."}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  {isMuted ? "Microphone is muted" : "Ready to listen..."}
                </Typography>
              )}

              {/* Messages display */}
              <Box sx={{ mt: 2, textAlign: "left" }}>
                {messages.slice(-3).map((msg, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 1,
                      p: 1,
                      borderRadius: 2,
                      bgcolor: msg.sender === "user" ? "rgba(138, 162, 211, 0.2)" : "rgba(156, 137, 184, 0.2)",
                      animation: "fadeIn 0.5s",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: "bold", color: msg.sender === "user" ? "primary.main" : "secondary.main" }}
                    >
                      {msg.sender === "user" ? "You" : "Serenova"}:
                    </Typography>
                    <Typography variant="body2">{msg.content}</Typography>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>
            </Box>
          )}

          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <IconButton
                sx={{
                  bgcolor: isMuted ? "error.main" : "action.selected",
                  color: "white",
                  "&:hover": { bgcolor: isMuted ? "error.dark" : "action.selected" },
                  p: 2,
                }}
                onClick={toggleMute}
                disabled={callStatus !== "active"}
              >
                {isMuted ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {isMuted ? "Unmute" : "Mute"}
              </Typography>
            </Grid>

            <Grid item>
              <Fab color="error" sx={{ p: 3 }} onClick={handleEndCall}>
                <CallEndIcon fontSize="large" />
              </Fab>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                End
              </Typography>
            </Grid>

            <Grid item>
              <IconButton
                sx={{
                  bgcolor: !isSpeakerOn ? "error.main" : "action.selected",
                  color: "white",
                  "&:hover": { bgcolor: !isSpeakerOn ? "error.dark" : "action.selected" },
                  p: 2,
                }}
                onClick={toggleSpeaker}
                disabled={callStatus !== "active"}
              >
                {isSpeakerOn ? <VolumeUpIcon /> : <VolumeOffIcon />}
              </IconButton>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {isSpeakerOn ? "Speaker" : "Speaker Off"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      {/* Hidden audio element for playing AI responses */}
      <audio
        ref={audioRef}
        style={{ display: "none" }}
        preload="auto"
        crossOrigin="anonymous"
        loop={false}
        onPlay={() => {
          console.log("Audio started playing")
          setIsAiSpeaking(true)
        }}
        onEnded={() => {
          console.log("Audio playback ended")
          setIsAiSpeaking(false)

          // Clean up the audio URL if it's a blob URL
          if (audioRef.current && audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
            URL.revokeObjectURL(audioRef.current.src)
          }

          // Restart recognition after AI is done speaking
          if (callStatus === "active" && !isRecording && recognition) {
            setTimeout(() => {
              try {
                setIsRecording(true)
                recognition.start()
              } catch (error) {
                console.error("Error restarting recognition:", error)
              }
            }, 500)
          }
        }}
        onError={(e) => {
          console.error("Audio playback error:", e)
          enqueueSnackbar("Error playing audio response. Using fallback TTS.", { variant: "warning" })

          // Clean up the audio URL if it's a blob URL
          if (audioRef.current && audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
            URL.revokeObjectURL(audioRef.current.src)
          }

          // Get the last AI message
          const lastAiMessage = messages.filter((msg) => msg.sender === "ai").pop()

          // Use browser's built-in speech synthesis as fallback
          if ("speechSynthesis" in window && lastAiMessage) {
            const utterance = new SpeechSynthesisUtterance(lastAiMessage.content)

            // Make sure we're not already speaking
            speechSynthesis.cancel()

            utterance.onend = () => {
              setIsAiSpeaking(false)
              // Restart recognition after speech is done
              if (callStatus === "active" && !isRecording && recognition) {
                setTimeout(() => {
                  try {
                    setIsRecording(true)
                    recognition.start()
                  } catch (error) {
                    console.error("Error restarting recognition:", error)
                  }
                }, 500)
              }
            }

            setIsAiSpeaking(true)
            speechSynthesis.speak(utterance)
          } else {
            setIsAiSpeaking(false)
          }
        }}
      />
    </Box>
  )
}

export default CallPage

