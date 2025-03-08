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
  TextField,
  Paper,
  Avatar,
  useTheme,
  ListItemButton,
  ListItemAvatar,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  GlobalStyles,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import Logo from "../components/Logo"
import FloatingObjects from "../components/FloatingObjects"
import { useThemeContext } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"
import { useSnackbar } from "notistack"
import { createChat, sendMessage, getUserChats, getChat, deleteChat } from "../services/chatService"
import { initSocket, joinChat, leaveChat, disconnectSocket } from "../services/socketService"

// Icons
import MenuIcon from "@mui/icons-material/Menu"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import LogoutIcon from "@mui/icons-material/Logout"
import SettingsIcon from "@mui/icons-material/Settings"
import SendIcon from "@mui/icons-material/Send"
import MicIcon from "@mui/icons-material/Mic"
import StopIcon from "@mui/icons-material/Stop"
import HomeIcon from "@mui/icons-material/Home"
import HistoryIcon from "@mui/icons-material/History"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import DeleteIcon from "@mui/icons-material/Delete"
import AddIcon from "@mui/icons-material/Add"
import ChatIcon from "@mui/icons-material/Chat"

// Define global styles using MUI's GlobalStyles component
const globalStyles = {
  "@keyframes pulse": {
    "0%": { transform: "scale(1)" },
    "50%": { transform: "scale(1.2)" },
    "100%": { transform: "scale(1)" },
  },
}

const ChatPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { toggleTheme, mode } = useThemeContext()
  const theme = useTheme()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()
  const { enqueueSnackbar } = useSnackbar()
  const [message, setMessage] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState([])
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [recognition, setRecognition] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState("")

  const messagesEndRef = useRef(null)
  const socket = useRef(null)

  // Add this function at the beginning of the component
  const handleSocketError = (error) => {
    console.error("Socket error:", error)
    enqueueSnackbar("Chat connection error. Some features may be limited.", {
      variant: "warning",
      autoHideDuration: 3000,
    })
  }

  // Then update the socket initialization in the useEffect
  useEffect(() => {
    try {
      socket.current = initSocket()

      if (socket.current) {
        socket.current.on("connect_error", handleSocketError)
      }
    } catch (error) {
      console.error("Failed to initialize socket:", error)
    }

    return () => {
      if (socket.current) {
        socket.current.off("connect_error", handleSocketError)
        disconnectSocket()
      }
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
          console.log("Transcript updated:", currentTranscript)
          setTranscript(currentTranscript)
          setMessage(currentTranscript)
        }

        recognitionInstance.onerror = (event) => {
          console.error("Speech recognition error", event.error)
          enqueueSnackbar(`Speech recognition error: ${event.error}. Try using Chrome browser for best results.`, {
            variant: "error",
          })
          setIsRecording(false)
          setIsVoiceMode(false)
        }

        recognitionInstance.onend = () => {
          console.log("Speech recognition ended naturally")
          // Only process if we didn't manually stop it
          if (isRecording) {
            // Don't automatically send the message here, let the stop button handle it
            setIsRecording(false)
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
            console.log("Recognition stopped on cleanup")
          } catch (error) {
            console.error("Error stopping recognition on cleanup:", error)
          }
        }
      }
    }
  }, [])

  // Load chat history
  useEffect(() => {
    if (currentUser) {
      loadChatHistory()
    }
  }, [currentUser])

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Join chat room when currentChatId changes
  useEffect(() => {
    if (currentChatId) {
      joinChat(currentChatId)

      // Listen for message updates
      if (socket.current) {
        socket.current.on("message-update", (data) => {
          if (data.chatId === currentChatId) {
            loadChat(currentChatId)
          }
        })
      }
    }

    return () => {
      if (currentChatId) {
        leaveChat(currentChatId)

        // Remove event listener
        if (socket.current) {
          socket.current.off("message-update")
        }
      }
    }
  }, [currentChatId])

  // Fix the loadChatHistory function to ensure chatHistory is always an array
  const loadChatHistory = async () => {
    try {
      setIsLoading(true)
      const response = await getUserChats(currentUser.uid)

      // Ensure we always set an array
      setChatHistory(response.chats || [])

      // Only show error notification if it's not a new user with no chats
      if (!response.success && response.error && response.error !== "No chats found") {
        enqueueSnackbar("Failed to load chat history", { variant: "error" })
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
      setChatHistory([])
      // Don't show error for new users
    } finally {
      setIsLoading(false)
    }
  }

  // Fix the loadChat function to handle errors better
  const loadChat = async (chatId) => {
    try {
      setIsLoading(true)
      const response = await getChat(chatId)
      if (response && response.chat && response.chat.messages) {
        setMessages(response.chat.messages)
        setCurrentChatId(chatId)
      } else {
        throw new Error("Invalid chat data received")
      }
    } catch (error) {
      console.error("Error loading chat:", error)
      enqueueSnackbar("Failed to load chat", { variant: "error" })
      // Reset to a new chat if loading fails
      setMessages([])
      setCurrentChatId(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentChatId(null)
    setDrawerOpen(false) // Close drawer after selecting new chat
  }

  const handleDeleteChat = async () => {
    try {
      await deleteChat(chatToDelete)
      enqueueSnackbar("Chat deleted successfully", { variant: "success" })

      // If the deleted chat is the current chat, clear the messages
      if (chatToDelete === currentChatId) {
        setMessages([])
        setCurrentChatId(null)
      }

      // Reload chat history
      loadChatHistory()
    } catch (error) {
      console.error("Error deleting chat:", error)
      enqueueSnackbar("Failed to delete chat", { variant: "error" })
    } finally {
      setDeleteDialogOpen(false)
      setChatToDelete(null)
    }
  }

  const toggleDrawer = (open) => (event) => {
    if (event && event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setDrawerOpen(open)
  }

  const handleSendMessage = async () => {
    if (message.trim() === "") return

    try {
      setIsLoading(true)

      // Add user message to the UI immediately
      const userMessage = { content: message, sender: "user", timestamp: new Date() }
      setMessages((prev) => [...prev, userMessage])

      // Clear input
      setMessage("")

      // If it's a new chat, create a new chat
      if (!currentChatId) {
        const response = await createChat({
          userId: currentUser.uid,
          message: userMessage.content,
          isVoice: false,
        })
        setCurrentChatId(response.chat._id)
        setMessages(response.chat.messages)

        // Update chat history
        loadChatHistory()
      } else {
        // Send message to existing chat
        const response = await sendMessage(currentChatId, {
          message: userMessage.content,
          isVoice: false,
        })
        setMessages(response.chat.messages)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      enqueueSnackbar("Failed to send message", { variant: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const toggleVoiceMode = () => {
    console.log("Toggling voice mode, current state:", isVoiceMode, isRecording)
    if (!isVoiceMode) {
      // Switch to voice mode
      setIsVoiceMode(true)
      startRecording()
    } else {
      // If we're already in voice mode, stop recording
      stopRecording()
    }
  }

  const startRecording = () => {
    if (recognition) {
      setTranscript("")
      try {
        // Check if recognition is already running
        if (isRecording) {
          console.log("Recognition is already running, stopping first")
          recognition.stop()
          // Add a small delay before starting again
          setTimeout(() => {
            setIsRecording(true)
            recognition.start()
            console.log("Recognition started after stopping")
          }, 300)
        } else {
          setIsRecording(true)
          recognition.start()
          console.log("Recognition started")
        }
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        enqueueSnackbar("Error starting speech recognition", { variant: "error" })
        setIsRecording(false)
        setIsVoiceMode(false)
      }
    } else {
      enqueueSnackbar("Speech recognition is not available", { variant: "error" })
      setIsVoiceMode(false)
    }
  }

  const stopRecording = () => {
    console.log("Stopping recording, isRecording:", isRecording, "transcript:", transcript)
    if (recognition && isRecording) {
      try {
        recognition.stop()
        console.log("Recognition stopped")

        // Process the transcript after a small delay to ensure it's complete
        setTimeout(() => {
          if (transcript.trim() !== "") {
            console.log("Processing transcript:", transcript)
            handleSendVoiceMessage()
          } else {
            console.log("No transcript to process")
            enqueueSnackbar("No speech detected", { variant: "warning" })
          }
          setIsRecording(false)
          setIsVoiceMode(false)
        }, 300)
      } catch (error) {
        console.error("Error stopping speech recognition:", error)
        setIsRecording(false)
        setIsVoiceMode(false)
      }
    }
  }

  const handleSendVoiceMessage = async () => {
    console.log("Handling voice message, transcript:", transcript)
    if (transcript.trim() === "") {
      console.log("Empty transcript, not sending")
      return
    }

    try {
      setIsLoading(true)

      // Add user message to the UI immediately
      const userMessage = {
        content: transcript,
        sender: "user",
        timestamp: new Date(),
        isVoice: true,
      }
      setMessages((prev) => [...prev, userMessage])
      console.log("Added user message to UI:", userMessage)

      // Clear input and transcript
      setMessage("")
      setTranscript("")

      // If it's a new chat, create a new chat
      if (!currentChatId) {
        console.log("Creating new chat with voice message")
        const response = await createChat({
          userId: currentUser.uid,
          message: "",
          isVoice: true,
          transcription: userMessage.content,
        })
        setCurrentChatId(response.chat._id)
        setMessages(response.chat.messages)
        console.log("New chat created:", response.chat._id)

        // Update chat history
        loadChatHistory()
      } else {
        // Send message to existing chat
        console.log("Sending voice message to existing chat:", currentChatId)
        const response = await sendMessage(currentChatId, {
          message: "",
          isVoice: true,
          transcription: userMessage.content,
        })
        setMessages(response.chat.messages)
        console.log("Message sent to existing chat")
      }
    } catch (error) {
      console.error("Error sending voice message:", error)
      enqueueSnackbar("Failed to send voice message", { variant: "error" })
    } finally {
      setIsLoading(false)
      setIsVoiceMode(false)
    }
  }

  const goBack = () => {
    navigate("/home")
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
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

  // Add a function to render formatted message content with markdown-like syntax
  const renderFormattedMessage = (content) => {
    if (!content) return null

    // Split by newlines to handle paragraphs
    const paragraphs = content.split("\n").filter((p) => p.trim() !== "")

    return (
      <>
        {paragraphs.map((paragraph, idx) => {
          // Check if it's a bullet point
          if (
            paragraph.trim().startsWith("•") ||
            paragraph.trim().startsWith("-") ||
            paragraph.trim().startsWith("*")
          ) {
            return (
              <Typography key={idx} variant="body1" component="li" sx={{ mb: 1 }}>
                {formatTextWithBold(paragraph.replace(/^[•\-*]\s*/, ""))}
              </Typography>
            )
          }

          // Check if it's a numbered list item
          if (/^\d+\.\s/.test(paragraph)) {
            return (
              <Typography key={idx} variant="body1" component="li" sx={{ mb: 1 }}>
                {formatTextWithBold(paragraph.replace(/^\d+\.\s*/, ""))}
              </Typography>
            )
          }

          // Regular paragraph
          return (
            <Typography key={idx} variant="body1" sx={{ mb: 1 }}>
              {formatTextWithBold(paragraph)}
            </Typography>
          )
        })}
      </>
    )
  }

  // Function to format text with bold using ** or __ syntax
  const formatTextWithBold = (text) => {
    if (!text) return null

    // Replace **text** or __text__ with bold
    const parts = []
    let lastIndex = 0

    // Match both ** and __ patterns for bold text
    const boldRegex = /(\*\*|__)(.*?)\1/g
    let match

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      // Add the bold text
      parts.push(<strong key={match.index}>{match[2]}</strong>)

      lastIndex = match.index + match[0].length
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    return parts.length > 0 ? parts : text
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
            <ListItemText primary="Chat History" />
          </ListItem>

          <ListItem>
            <ListItemButton onClick={handleNewChat}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="New Chat" />
            </ListItemButton>
          </ListItem>
        </List>

        <Divider />

        {/* Update the List rendering to check if chatHistory exists and is an array */}
        <List sx={{ maxHeight: "40vh", overflow: "auto" }}>
          {Array.isArray(chatHistory) && chatHistory.length > 0 ? (
            chatHistory.map((chat) => (
              <ListItem key={chat._id} sx={{ pl: 4 }}>
                <ListItemButton
                  onClick={() => {
                    loadChat(chat._id)
                    setDrawerOpen(false)
                  }}
                  selected={currentChatId === chat._id}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <ChatIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={chat.title}
                    secondary={formatDate(chat.updatedAt)}
                    primaryTypographyProps={{ variant: "body2" }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation()
                      setChatToDelete(chat._id)
                      setDeleteDialogOpen(true)
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <Box sx={{ p: 2, textAlign: "center", width: "100%" }}>
                <Typography variant="body2" color="text.secondary">
                  No chat history yet. Start a new conversation!
                </Typography>
              </Box>
            </ListItem>
          )}
        </List>

        <Divider />
        <List>
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
      {/* Chat Messages */}
      <Box
        sx={{
          flexGrow: 1,
          p: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          mt: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              opacity: 0.7,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 300, mb: 2 }}>
              Start chatting with <span style={{ fontWeight: 200 }}>Serenova</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Your AI mental health companion is ready to listen and help
            </Typography>
          </Box>
        ) : (
          messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              {msg.sender === "ai" && (
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    mr: 1,
                  }}
                >
                  S
                </Avatar>
              )}

              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: "70%",
                  borderRadius: 3,
                  bgcolor:
                    msg.sender === "user"
                      ? theme.palette.primary.main
                      : theme.palette.mode === "dark"
                        ? "rgba(30, 41, 59, 0.8)"
                        : "rgba(230, 235, 242, 0.8)",
                  color: msg.sender === "user" ? "#fff" : "text.primary",
                }}
              >
                {msg.sender === "user" ? (
                  <Typography variant="body1">{msg.content}</Typography>
                ) : (
                  <Box component="div" sx={{ "& ul, & ol": { pl: 2 } }}>
                    {renderFormattedMessage(msg.content)}
                  </Box>
                )}
              </Paper>

              {msg.sender === "user" && (
                <Avatar
                  sx={{
                    bgcolor: theme.palette.secondary.main,
                    ml: 1,
                  }}
                >
                  {currentUser?.displayName?.charAt(0) || "U"}
                </Avatar>
              )}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      {/* Message Input */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderRadius: "16px 16px 0 0",
          backdropFilter: "blur(10px)",
          background: (theme) => (theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.8)" : "rgba(230, 235, 242, 0.8)"),
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            color={isVoiceMode ? "secondary" : "primary"}
            onClick={toggleVoiceMode}
            sx={{
              mr: 1,
              animation: isRecording ? "pulse 1.5s infinite" : "none",
            }}
            disabled={isLoading || isTranscribing}
          >
            {isVoiceMode ? isRecording ? <StopIcon /> : <MicIcon /> : <MicIcon />}
          </IconButton>

          <TextField
            fullWidth
            placeholder={isRecording ? "Listening..." : "Message Serenova..."}
            variant="outlined"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isRecording || isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(15, 23, 42, 0.3)" : "rgba(255, 255, 255, 0.5)",
              },
            }}
          />

          <IconButton
            color="primary"
            onClick={isVoiceMode ? stopRecording : handleSendMessage}
            disabled={isVoiceMode ? !isRecording : message.trim() === "" || isLoading}
            sx={{ ml: 1 }}
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>
      {/* Delete Chat Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Chat</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this chat? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteChat} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ChatPage

