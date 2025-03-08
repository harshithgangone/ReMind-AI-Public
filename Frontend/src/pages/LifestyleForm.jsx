"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSnackbar } from "notistack"
import { Box, Container, Typography, Button, Paper, Slider, AppBar, Toolbar, CircularProgress } from "@mui/material"
import Logo from "../components/Logo"
import FloatingObjects from "../components/FloatingObjects"
import BedtimeIcon from "@mui/icons-material/Bedtime"
import WorkIcon from "@mui/icons-material/Work"

const LifestyleForm = () => {
  const [workHours, setWorkHours] = useState(8)
  const [sleepHours, setSleepHours] = useState(7)
  const [loading, setLoading] = useState(false)
  const { currentUser, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const handleWorkHoursChange = (event, newValue) => {
    setWorkHours(newValue)
  }

  const handleSleepHoursChange = (event, newValue) => {
    setSleepHours(newValue)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await updateUserProfile({
        workHours,
        sleepHours,
        onboardingComplete: true,
      })
      enqueueSnackbar("Lifestyle information updated successfully!", { variant: "success" })
      // Set a flag to show the "Let's Start" animation
      localStorage.setItem("showLetsStartAnimation", "true")
      navigate("/home")
    } catch (error) {
      console.error("Error updating lifestyle information:", error)
      enqueueSnackbar("Failed to update lifestyle information", { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <FloatingObjects />
      <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: "blur(10px)" }}>
        <Toolbar>
          <Logo />
        </Toolbar>
      </AppBar>
      <Toolbar />
      <Container
        maxWidth="sm"
        sx={{
          py: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            borderRadius: 3,
            background: (theme) =>
              theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid",
            borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"),
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            align="center"
            gutterBottom
            className="form-fade-up"
            sx={{
              fontWeight: 600,
              mb: 3,
              background: "linear-gradient(45deg, #8aa2d3 30%, #9c89b8 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              "--index": 0,
            }}
          >
            Your Lifestyle
          </Typography>

          <Typography variant="body1" align="center" gutterBottom className="form-fade-up" sx={{ mb: 4, "--index": 1 }}>
            Help us understand your daily routine
          </Typography>

          <Box sx={{ mb: 4 }} className="form-fade-up" style={{ "--index": 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <WorkIcon sx={{ mr: 2, color: "primary.main" }} />
              <Typography variant="h6">Work Hours: {workHours} hours/day</Typography>
            </Box>
            <Slider
              value={workHours}
              onChange={handleWorkHoursChange}
              aria-labelledby="work-hours-slider"
              valueLabelDisplay="auto"
              step={0.5}
              marks
              min={0}
              max={16}
              sx={{ mb: 4 }}
              disabled={loading}
            />

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <BedtimeIcon sx={{ mr: 2, color: "secondary.main" }} />
              <Typography variant="h6">Sleep Hours: {sleepHours} hours/day</Typography>
            </Box>
            <Slider
              value={sleepHours}
              onChange={handleSleepHoursChange}
              aria-labelledby="sleep-hours-slider"
              valueLabelDisplay="auto"
              step={0.5}
              marks
              min={3}
              max={12}
              disabled={loading}
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={loading}
            className="form-fade-up"
            sx={{ py: 1.5, "--index": 3 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Let's Start"}
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}

export default LifestyleForm

