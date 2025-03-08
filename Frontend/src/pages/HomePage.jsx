"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Container,
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
  Card,
  Grid,
  Avatar,
  useTheme,
} from "@mui/material"
import Logo from "../components/Logo"
import FloatingObjects from "../components/FloatingObjects"
import { useThemeContext } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"

// Icons
import MenuIcon from "@mui/icons-material/Menu"
import DarkModeIcon from "@mui/icons-material/DarkMode"
import LightModeIcon from "@mui/icons-material/LightMode"
import BookIcon from "@mui/icons-material/Book"
import SportsEsportsIcon from "@mui/icons-material/SportsEsports"
import SupportIcon from "@mui/icons-material/Support"
import PeopleIcon from "@mui/icons-material/People"
import LogoutIcon from "@mui/icons-material/Logout"
import SettingsIcon from "@mui/icons-material/Settings"
import ChatIcon from "@mui/icons-material/Chat"
import PhoneIcon from "@mui/icons-material/Phone"
import VideocamIcon from "@mui/icons-material/Videocam"

const HomePage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { toggleTheme, mode } = useThemeContext()
  const theme = useTheme()
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  useEffect(() => {
    document.body.classList.add("home-fade-in")
    return () => {
      document.body.classList.remove("home-fade-in")
    }
  }, [])

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setDrawerOpen(open)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const sidebarItems = [
    { text: "Journals", icon: <BookIcon />, path: "/journals" },
    { text: "Games", icon: <SportsEsportsIcon />, path: "/games" },
    { text: "Help Line", icon: <SupportIcon />, path: "/helpline" },
    { text: "Community", icon: <PeopleIcon />, path: "/community" },
  ]

  const contactOptions = [
    {
      title: "Text with me",
      icon: <ChatIcon sx={{ fontSize: 60, color: "white" }} />,
      color: theme.palette.primary.main,
      path: "/chat",
    },
    {
      title: "Call with me",
      icon: <PhoneIcon sx={{ fontSize: 60, color: "white" }} />,
      color: theme.palette.secondary.main,
      path: "/call",
    },
    {
      title: "Facetime with me",
      icon: <VideocamIcon sx={{ fontSize: 60, color: "white" }} />,
      color: "#5a9c83",
      path: "/facetime",
    },
  ]

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
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

          
          <IconButton onClick={toggleTheme} color="inherit">
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
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
              theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.95)" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Logo disableClick={true} />
        </Box>
        <Divider />
        <List>
          {sidebarItems.map((item, index) => (
            <ListItem button key={item.text} onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem button onClick={() => navigate("/settings")}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Profile Settings" />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <Toolbar />
      <Container maxWidth="lg" sx={{ py: 8, mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 300,textAlign:"center",fontSize:"40px" }}>
            Welcome, {currentUser?.displayName || "User"}!
          </Typography>

        <Typography
          variant="h3"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            mb: 6,
            fontWeight: 600,
            background: "linear-gradient(45deg, #8aa2d3 30%, #9c89b8 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Meet our AI model
          <Typography
            component="span"
            sx={{
              fontWeight: 200, // Very thin font weight
              fontSize: "50px",
              background: "linear-gradient(45deg, #8aa2d3 30%, #9c89b8 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginLeft: "20px",
              ml: 0.5,
            }}
          >
            Serenova
          </Typography>
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {contactOptions.map((option, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                onClick={() => navigate(option.path)}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-10px) scale(1.03)",
                  },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  borderRadius: 4,
                  background: theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.8)",
                }}
              >
                <Avatar sx={{ width: 120, height: 120, mb: 3, bgcolor: option.color }}>{option.icon}</Avatar>
                <Typography variant="h5" component="div" align="center" fontWeight={600}>
                  {option.title}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Typography
            component="span"
            sx={{
              fontWeight: 200, // Very thin font weight
              fontSize: "20px",
              background: "linear-gradient(45deg, #8aa2d3 30%, #9c89b8 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginLeft: "20px",
              textAlign:"center",
              
              
              ml: 0.5,
            }}
          >
            Developed by Team DevXO
          </Typography>
    </Box>
  )
}

export default HomePage

