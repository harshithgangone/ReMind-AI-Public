import { Card, CardContent, Typography, Avatar } from "@mui/material"
import { useThemeContext } from "../context/ThemeContext"

const FeatureCard = ({ icon, title, description, index }) => {
  const { mode } = useThemeContext()

  // Generate a gradient based on the index
  const getGradient = (idx) => {
    const gradients = [
      "linear-gradient(135deg, #6b8ac9 0%, #8aa2d3 100%)",
      "linear-gradient(135deg, #8871a9 0%, #9c89b8 100%)",
      "linear-gradient(135deg, #3a7563 0%, #5a9c83 100%)",
      "linear-gradient(135deg, #a06b8a 0%, #c88ba9 100%)",
      "linear-gradient(135deg, #4a6b8a 0%, #6a8ba9 100%)",
      "linear-gradient(135deg, #8a6b4a 0%, #a98b6a 100%)",
      "linear-gradient(135deg, #6b8a4a 0%, #8ba96a 100%)",
      "linear-gradient(135deg, #8a4a6b 0%, #a96a8b 100%)",
    ]
    return gradients[idx % gradients.length]
  }

  return (
    <Card
      className="feature-card"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        animationDelay: `${index * 0.1}s`,
        background: mode === "dark" ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        border: "1px solid",
        borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "5px",
          background: getGradient(index),
          transform: "scaleX(0)",
          transformOrigin: "left",
          transition: "transform 0.4s ease",
        },
        "&:hover::after": {
          transform: "scaleX(1)",
        },
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Avatar
          className="feature-icon"
          sx={{
            width: 80,
            height: 80,
            mb: 2,
            background: getGradient(index),
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="h5" component="div" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default FeatureCard

