"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useSnackbar } from "notistack"
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  AppBar,
  Toolbar,
  CircularProgress,
} from "@mui/material"
import Logo from "../components/Logo"
import FloatingObjects from "../components/FloatingObjects"

const OccupationForm = () => {
  const [occupation, setOccupation] = useState("")
  const [loading, setLoading] = useState(false)
  const { currentUser, updateUserProfile } = useAuth()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()

  const handleChange = (e) => {
    setOccupation(e.target.value)
  }

  const handleSubmit = async () => {
    if (!occupation) return

    setLoading(true)
    try {
      await updateUserProfile({ occupation })
      enqueueSnackbar("Occupation updated successfully!", { variant: "success" })
      navigate("/lifestyle")
    } catch (error) {
      console.error("Error updating occupation:", error)
      enqueueSnackbar("Failed to update occupation", { variant: "error" })
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
            Tell Us About Yourself
          </Typography>

          <Typography variant="body1" align="center" gutterBottom className="form-fade-up" sx={{ mb: 4, "--index": 1 }}>
            This helps us personalize your experience
          </Typography>

          <Box sx={{ mb: 4 }} className="form-fade-up" style={{ "--index": 2 }}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="occupation-label">What is your occupation?</InputLabel>
              <Select
                labelId="occupation-label"
                id="occupation"
                value={occupation}
                onChange={handleChange}
                label="What is your occupation?"
                disabled={loading}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="business">Business Owner</MenuItem>
                <MenuItem value="professional">Working Professional</MenuItem>
                <MenuItem value="healthcare">Healthcare Worker</MenuItem>
                <MenuItem value="education">Education Professional</MenuItem>
                <MenuItem value="technology">Technology Professional</MenuItem>
                <MenuItem value="creative">Creative Professional</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            onClick={handleSubmit}
            disabled={!occupation || loading}
            className="form-fade-up"
            sx={{ py: 1.5, "--index": 3 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Continue"}
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}

export default OccupationForm

