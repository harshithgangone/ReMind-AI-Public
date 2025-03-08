"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { CssBaseline } from "@mui/material"
import { useAuth } from "./context/AuthContext"

// Pages
import LandingPage from "./pages/LandingPage"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import OccupationForm from "./pages/OccupationForm"
import LifestyleForm from "./pages/LifestyleForm"
import HomePage from "./pages/HomePage"
import ChatPage from "./pages/ChatPage"
import CallPage from "./pages/CallPage"
import VideoCallPage from "./pages/VideoCallPage"

// Components
import CustomCursor from "./components/CustomCursor"
import StartupAnimation from "./components/StartupAnimation"
import LoadingScreen from "./components/LoadingScreen"

function App() {
  const [initializing, setInitializing] = useState(true)
  const [showStartup, setShowStartup] = useState(true)
  const [showLetsStart, setShowLetsStart] = useState(false)
  const { currentUser } = useAuth()

  useEffect(() => {
    // Check if we should show the "Let's Start" animation
    const shouldShowLetsStart = localStorage.getItem("showLetsStartAnimation") === "true"
    if (shouldShowLetsStart) {
      setShowLetsStart(true)
      localStorage.removeItem("showLetsStartAnimation")

      // Show "Let's Start" for 2 seconds
      const timer = setTimeout(() => {
        setShowLetsStart(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    // Show startup animation for 5 seconds
    const startupTimer = setTimeout(() => {
      setShowStartup(false)
    }, 5000)

    // Set initializing to false after a delay
    const initTimer = setTimeout(() => {
      setInitializing(false)
    }, 1000)

    return () => {
      clearTimeout(startupTimer)
      clearTimeout(initTimer)
    }
  }, [])

  if (initializing) {
    return <LoadingScreen />
  }

  if (showStartup) {
    return <StartupAnimation />
  }

  if (showLetsStart) {
    return <LoadingScreen text="Let's Start" />
  }

  return (
    <>
      <CssBaseline />
      <CustomCursor />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/occupation" element={currentUser ? <OccupationForm /> : <Navigate to="/" />} />
          <Route path="/lifestyle" element={currentUser ? <LifestyleForm /> : <Navigate to="/" />} />
          <Route path="/home" element={currentUser ? <HomePage /> : <Navigate to="/" />} />
          <Route path="/chat" element={currentUser ? <ChatPage /> : <Navigate to="/" />} />
          <Route path="/call" element={currentUser ? <CallPage /> : <Navigate to="/" />} />
          <Route path="/facetime" element={currentUser ? <VideoCallPage /> : <Navigate to="/" />} />
        </Routes>
      </Router>
    </>
  )
}

export default App

