"use client"

import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  AppBar,
  Toolbar,
  useScrollTrigger,
  Slide,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import Logo from "../components/Logo"
import FeatureCard from "../components/FeatureCard"
import FloatingObjects from "../components/FloatingObjects"
import { useThemeContext } from "../context/ThemeContext"
import { useAuth } from "../context/AuthContext"

// Icons
import SentimentSatisfiedAltIcon from "@mui/icons-material/SentimentSatisfiedAlt"
import ChatIcon from "@mui/icons-material/Chat"
import TrackChangesIcon from "@mui/icons-material/TrackChanges"
import RecommendIcon from "@mui/icons-material/Recommend"
import SosIcon from "@mui/icons-material/Sos"
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement"
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver"
import WatchIcon from "@mui/icons-material/Watch"

function HideOnScroll(props) {
  const { children } = props
  const trigger = useScrollTrigger()

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  )
}

const LandingPage = () => {
  const { mode } = useThemeContext()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const featuresRef = useRef(null)

  // Refs for scroll reveal elements
  const featureTitleRef = useRef(null)
  const featureCardRefs = useRef([])
  const footerRef = useRef(null)

  // Set up scroll reveal
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    }

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible")
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Observe feature title
    if (featureTitleRef.current) {
      featureTitleRef.current.classList.add("scroll-reveal")
      observer.observe(featureTitleRef.current)
    }

    // Observe feature cards
    featureCardRefs.current.forEach((ref) => {
      if (ref) {
        ref.classList.add("scroll-reveal")
        observer.observe(ref)
      }
    })

    // Observe footer
    if (footerRef.current) {
      footerRef.current.classList.add("scroll-reveal")
      observer.observe(footerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  const features = [
    {
      icon: <SentimentSatisfiedAltIcon fontSize="large" />,
      title: "AI-Powered Emotion Detection",
      description: "We detect emotion for better therapy, helping you understand your feelings better.",
    },
    {
      icon: <ChatIcon fontSize="large" />,
      title: "Conversational AI Chatbot",
      description: "Therapeutic & Context-Aware chatbot that understands your needs and provides support.",
    },
    {
      icon: <TrackChangesIcon fontSize="large" />,
      title: "Mood Tracking & Journaling",
      description: "Track your mood over time and journal your thoughts to identify patterns.",
    },
    {
      icon: <RecommendIcon fontSize="large" />,
      title: "Personalized Self-Help Recommendations",
      description: "Get tailored recommendations based on your emotional state and needs.",
    },
    {
      icon: <SosIcon fontSize="large" />,
      title: "SOS Mode & Crisis Assistance",
      description: "Immediate support during emotional crises with resources and guidance.",
    },
    {
      icon: <SelfImprovementIcon fontSize="large" />,
      title: "AI-Powered Guided Meditation & Breathwork",
      description: "Personalized meditation and breathing exercises to help you relax and focus.",
    },
    {
      icon: <RecordVoiceOverIcon fontSize="large" />,
      title: "Speech Emotion Recognition",
      description: "Advanced technology that detects emotions in your voice to provide better therapeutic support.",
    },
    {
      icon: <WatchIcon fontSize="large" />,
      title: "Wearable Integration",
      description: "Connect with your smartwatch, Fitbit, and other wearables to track physical indicators of stress.",
    },
  ]

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleGetStarted = () => {
    navigate("/signup")
  }

  // Update the LandingPage to redirect to home if user is logged in
  const { currentUser } = useAuth()

  useEffect(() => {
    if (currentUser) {
      navigate("/home")
    }
  }, [currentUser, navigate])

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <FloatingObjects />
      <HideOnScroll>
        <AppBar position="fixed" color="transparent" elevation={0} sx={{ backdropFilter: "blur(10px)" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Logo />
            {/* Remove the login button from here */}
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Toolbar /> {/* Spacer for fixed AppBar */}
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          minHeight: "80vh",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h1"
            component="h1"
            className="hero-text"
            sx={{
              mb: 2,
              fontSize: { xs: "2.5rem", md: "4rem" },
              fontWeight: 700,
              background: "linear-gradient(45deg, #8aa2d3 30%, #9c89b8 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome to ReMind AI
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            className="hero-text"
            sx={{
              mb: 6,
              opacity: 0.9,
              maxWidth: "800px",
              mx: "auto",
              animationDelay: "0.2s",
            }}
          >
            We help you reincarnate yourself, therapy you always needed!
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGetStarted}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              animationDelay: "0.4s",
              className: "hero-text",
            }}
          >
            Get Started
          </Button>

          {/* Center the Discover Features button */}
          <Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
            <Button
              variant="text"
              color="primary"
              onClick={scrollToFeatures}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: 0.7,
                "&:hover": { opacity: 1 },
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                Discover Features
              </Typography>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "2px solid",
                  borderColor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "bounce 2s infinite",
                }}
              >
                ↓
              </Box>
            </Button>
          </Box>
        </Container>
      </Box>
      {/* Features Section */}
      <Box ref={featuresRef} sx={{ py: 8, position: "relative" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h2"
            align="center"
            ref={featureTitleRef}
            sx={{
              mb: 8,
              fontWeight: 600,
              background: "linear-gradient(45deg, #8aa2d3 30%, #9c89b8 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Our Features
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box ref={(el) => (featureCardRefs.current[index] = el)}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    index={index}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Footer */}
      <Box
        component="footer"
        ref={footerRef}
        sx={{
          py: 6,
          bgcolor: mode === "dark" ? "rgba(15, 23, 42, 0.8)" : "rgba(248, 250, 252, 0.8)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid",
          borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ mb: 2 }}>
                <Logo />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Redefining mental health support with AI-powered therapy solutions.
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quick Links
              </Typography>
              <Box component="ul" sx={{ p: 0, m: 0, listStyle: "none" }}>
                {["Home", "About Us", "Features", "Pricing", "Contact"].map((item) => (
                  <Box component="li" key={item} sx={{ mb: 1 }}>
                    <Button
                      sx={{
                        p: 0,
                        textTransform: "none",
                        justifyContent: "flex-start",
                        color: "text.secondary",
                        "&:hover": { color: "primary.main" },
                      }}
                    >
                      {item}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Contact Us
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Email: info@remindai.com
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Phone: +1 (555) 123-4567
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: 123 AI Street, Tech City, TC 12345
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 6, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} ReMind AI. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default LandingPage

