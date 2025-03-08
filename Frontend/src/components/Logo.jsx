"use client"
import { Typography, Box } from "@mui/material"
import { useThemeContext } from "../context/ThemeContext"
import LightModeIcon from "@mui/icons-material/LightMode"
import DarkModeIcon from "@mui/icons-material/DarkMode"

const Logo = ({ size = "medium", disableClick = false }) => {
  const { toggleTheme, mode } = useThemeContext()

  const getFontSize = () => {
    switch (size) {
      case "small":
        return { fontSize: "1.5rem", aiSize: "1.3rem" }
      case "large":
        return { fontSize: "3rem", aiSize: "2.7rem" }
      case "medium":
      default:
        return { fontSize: "2rem", aiSize: "1.8rem" }
    }
  }

  const { fontSize, aiSize } = getFontSize()

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: disableClick ? "none" : "scale(1.05)",
        },
      }}
      onClick={disableClick ? undefined : toggleTheme}
    >
      <Typography
        variant="h1"
        component="div"
        sx={{
          fontWeight: 700,
          background: "linear-gradient(45deg, #8aa2d3 30%, #9c89b8 90%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          mr: 0.5,
          fontSize: fontSize,
          display: "flex",
          alignItems: "center",
        }}
      >
        ReMind
        <Typography
          component="span"
          sx={{
            fontWeight: 200, // Very thin font weight
            fontSize: getFontSize("medium"),
            background: "linear-gradient(45deg, #8aa2d3 30%, #9c89b8 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            ml: 0.5,
          }}
        >
          AI
        </Typography>
      </Typography>

      {!disableClick &&
        (mode === "dark" ? <LightModeIcon sx={{ color: "#8aa2d3" }} /> : <DarkModeIcon sx={{ color: "#9c89b8" }} />)}
    </Box>
  )
}

export default Logo

