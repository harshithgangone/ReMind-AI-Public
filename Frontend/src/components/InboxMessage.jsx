"use client"

import { useState, useEffect } from "react"
import { Paper, Typography, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import FavoriteIcon from "@mui/icons-material/Favorite"
import "./InboxMessage.css"

const InboxMessage = ({ message, onClose }) => {
  const [visible, setVisible] = useState(false)
  const [liked, setLiked] = useState(false)

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => {
      setVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 500) // Wait for animation to complete
  }

  return (
    <Paper className={`inbox-message ${visible ? "visible" : ""}`} elevation={3}>
      <div className="inbox-message-header">
        <Typography variant="subtitle2" color="textSecondary">
          Daily Reminder
        </Typography>
        <div className="inbox-message-actions">
          <IconButton size="small" onClick={() => setLiked(!liked)} className={liked ? "liked" : ""}>
            <FavoriteIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
      <Typography variant="body1" className="inbox-message-content">
        {message}
      </Typography>
    </Paper>
  )
}

export default InboxMessage

