"use client"
import { Paper, Typography, Box, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"

const Notification = ({ message, onClose }) => {
  return (
    <Paper className="notification" elevation={3} sx={{ p: 2, maxWidth: 300 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Typography variant="body1">{message}</Typography>
        <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  )
}

export default Notification

