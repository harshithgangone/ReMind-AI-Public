import { Box, Typography } from "@mui/material"
import { useThemeContext } from "../context/ThemeContext"

const LoadingScreen = ({ text }) => {
  const { mode } = useThemeContext()

  if (text === "Let's Start") {
    return (
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.default",
          zIndex: 9999,
        }}
      >
        <Typography
          variant="h2"
          className="lets-start-animation"
          sx={{
            mb: 4,
            background: "linear-gradient(45deg, #8aa2d3 30%, #9c89b8 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {text}
        </Typography>
      </Box>
    )
  }

  // Creative letter animation loader with continuous animation
  const letters = "ReMind AI"
  const colors = [
    "#8aa2d3", // primary
    "#9c89b8", // secondary
    "#6b8ac9", // primary dark
    "#8871a9", // secondary dark
    "#a6b8dd", // primary light
    "#b0a1c7", // secondary light
  ]

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
        zIndex: 9999,
      }}
    >
      <Box sx={{ position: "relative", height: 100, width: "100%", textAlign: "center" }}>
        {letters.split("").map((letter, index) => (
          <Typography
            key={index}
            variant="h1"
            component="span"
            sx={{
              display: "inline-block",
              fontWeight: letter === "A" || letter === "I" ? 200 : 700, // Thin font for AI
              fontSize: "4rem",
              color: colors[index % colors.length],
              position: "relative",
              mx: letter === " " ? 2 : 0.5,
              animation: "letterPulse 2s infinite",
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {letter}
            <Box
              sx={{
                position: "absolute",
                bottom: -10,
                left: 0,
                width: "100%",
                height: 4,
                background: colors[index % colors.length],
                animation: "barPulse 1.5s infinite",
                animationDelay: `${index * 0.1}s`,
                borderRadius: 2,
              }}
            />
          </Typography>
        ))}
      </Box>

      <style jsx global>{`
        @keyframes letterPulse {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.7; transform: translateY(-5px); }
        }
        
        @keyframes barPulse {
          0%, 100% { opacity: 1; width: 100%; }
          50% { opacity: 0.5; width: 70%; }
        }
      `}</style>
    </Box>
  )
}

export default LoadingScreen

