"use client"

import { useState, useEffect, useRef } from "react"
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
  Badge,
} from "@mui/material"
import { useNavigate } from "react-router-dom"
import Logo from "../components/Logo"
import FloatingObjects from "../components/FloatingObjects"
import { useThemeContext } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext" // Add this import

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
import InfoIcon from "@mui/icons-material/Info"
import FullscreenIcon from "@mui/icons-material/Fullscreen"
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit"

const VideoCallPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { toggleTheme, mode } = useThemeContext()
  const theme = useTheme()
  const navigate = useNavigate()
  const [callStatus, setCallStatus] = useState("connecting") // connecting, active, ended
  const [isMuted, setIsMuted] = useState(false)
  // Video is always on, so we don't need this state anymore
  const [callDuration, setCallDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callHistory] = useState([
    { id: 1, title: "Morning Therapy", date: "2 hours ago", duration: "15:23" },
    { id: 2, title: "Anxiety Support", date: "Yesterday", duration: "22:45" },
    { id: 3, title: "Meditation Session", date: "3 days ago", duration: "18:12" },
    { id: 4, title: "Stress Management", date: "Last week", duration: "25:30" },
  ])

  const userVideoRef = useRef(null)
  const videoContainerRef = useRef(null)
  const userVideoStream = useRef(null)
  const { logout } = useAuth() // Add this line

  useEffect(() => {
    // Simulate connecting and then active call
    const connectTimer = setTimeout(() => {
      setCallStatus("active")

      // Start user video
      startUserVideo()
    }, 2000)

    return () => {
      clearTimeout(connectTimer)
      stopUserVideo()
    }
  }, [])

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

  const startUserVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream
        userVideoStream.current = stream
      }
    } catch (err) {
      console.error("Error accessing camera:", err)
    }
  }

  const stopUserVideo = () => {
    if (userVideoStream.current) {
      userVideoStream.current.getTracks().forEach((track) => track.stop())
      userVideoStream.current = null
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setDrawerOpen(open)
  }

  const handleEndCall = () => {
    stopUserVideo()
    setCallStatus("ended")
    setTimeout(() => {
      navigate("/")
    }, 2000)
  }

  const toggleMute = () => {
    if (userVideoStream.current) {
      const audioTracks = userVideoStream.current.getAudioTracks()
      audioTracks.forEach((track) => {
        track.enabled = isMuted
      })
    }
    setIsMuted(!isMuted)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (videoContainerRef.current?.requestFullscreen) {
        videoContainerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

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

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
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
            <ListItemButton onClick={() => navigate("/")}>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <HistoryIcon />
            </ListItemIcon>
            <ListItemText primary="Video Call History" />
          </ListItem>
        </List>

        <List sx={{ maxHeight: "40vh", overflow: "auto" }}>
          {callHistory.map((call) => (
            <ListItem key={call.id} sx={{ pl: 4 }}>
              <ListItemButton>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <Typography variant="caption">{call.id}</Typography>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={call.title}
                  secondary={`${call.date} • ${call.duration}`}
                  primaryTypographyProps={{ variant: "body2" }}
                  secondaryTypographyProps={{ variant: "caption" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />
        <List>
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText
              primary="Call Transcripts"
              secondary="All video calls are stored as text for your reference"
              primaryTypographyProps={{ variant: "body2" }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </ListItem>
          <Divider />
          <ListItem button>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <Toolbar /> {/* Spacer for fixed AppBar */}
      {/* Video Call Interface */}
      <Box
        ref={videoContainerRef}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: "background.default",
          width: "100%",
          height: isFullscreen ? "100vh" : "100%",
          overflow: "hidden",
        }}
      >
        {/* Status bar */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            px: 2,
            py: 1,
            borderRadius: 2,
            bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.6)" : "rgba(230, 235, 242, 0.6)"),
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {callStatus === "connecting" && "Connecting to Serenova..."}
            {callStatus === "active" && `Call in progress • ${formatTime(callDuration)}`}
            {callStatus === "ended" && "Call ended"}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Badge color="success" variant="dot" sx={{ mr: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 200 }}>
                Serenova
              </Typography>
            </Badge>
          </Box>
        </Box>

        {/* Main video area */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            position: "relative",
            height: "100%",
          }}
        >
          {/* User Video (Main) */}
          <Box
            sx={{
              flexGrow: 1,
              height: { xs: "calc(100vh - 250px)", md: "auto" },
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              bgcolor: "black",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <video
              ref={userVideoRef}
              autoPlay
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                left: 8,
                p: 0.5,
                borderRadius: 1,
                bgcolor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <Typography variant="caption" color="white">
                You {isMuted && "(Muted)"}
              </Typography>
            </Box>
          </Box>

          {/* AI Video (Small) */}
          <Box
            sx={{
              width: { xs: "100%", md: 280 },
              height: { xs: 180, md: 210 },
              borderRadius: 4,
              overflow: "hidden",
              position: "relative",
              bgcolor: "black",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              border: "2px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            }}
          >
            {callStatus === "connecting" ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  animation: "pulse 1.5s infinite",
                }}
              >
                <Avatar
                  sx={{
                    width: 60,
                    height: 60,
                    mb: 1,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 200 }}>
                    S
                  </Typography>
                </Avatar>
                <Typography variant="caption" color="white" sx={{ fontWeight: 200 }}>
                  Connecting...
                </Typography>
              </Box>
            ) : (
              <>
                <Box
                  component="img"
                  src="/bot.png?height=200&width=200"
                  alt="AI Video"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    bgcolor: theme.palette.primary.main,
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    p: 0.5,
                    borderRadius: 1,
                    bgcolor: "rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <Typography variant="caption" color="white">
                    Serenova
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* Controls */}
        <Paper
          elevation={3}
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            background: (theme) =>
              theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.8)" : "rgba(230, 235, 242, 0.8)",
            position: isFullscreen ? "fixed" : "relative",
            bottom: isFullscreen ? 16 : "auto",
            left: isFullscreen ? "50%" : "auto",
            transform: isFullscreen ? "translateX(-50%)" : "none",
            width: isFullscreen ? "auto" : "100%",
            maxWidth: isFullscreen ? "90%" : "100%",
            zIndex: 1000,
            marginBottom: "100px",
          }}
        >
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item>
              <IconButton
                sx={{
                  bgcolor: isMuted ? "error.main" : "action.selected",
                  color: "white",
                  "&:hover": { bgcolor: isMuted ? "error.dark" : "action.selected" },
                  p: 2,
                }}
                onClick={toggleMute}
              >
                {isMuted ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: "center" }}>
                {isMuted ? "Unmute" : "Mute"}
              </Typography>
            </Grid>

            <Grid item>
              <Fab color="error" sx={{ p: 3 }} onClick={handleEndCall}>
                <CallEndIcon fontSize="large" />
              </Fab>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: "center" }}>
                End
              </Typography>
            </Grid>

            <Grid item>
              <IconButton
                sx={{
                  bgcolor: "action.selected",
                  color: "white",
                  "&:hover": { bgcolor: "action.selected" },
                  p: 2,
                }}
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
              <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: "center" }}>
                {isFullscreen ? "Exit" : "Fullscreen"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      <style jsx global>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }
      `}</style>
    </Box>
  )
}

export default VideoCallPage

