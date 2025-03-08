"use client"

import { useState, useEffect } from "react"
import "../components/CustomCursor.css"

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [hidden, setHidden] = useState(false)
  const [clicked, setClicked] = useState(false)
  const [linkHovered, setLinkHovered] = useState(false)

  useEffect(() => {
    const addEventListeners = () => {
      document.addEventListener("mousemove", onMouseMove)
      document.addEventListener("mouseenter", onMouseEnter)
      document.addEventListener("mouseleave", onMouseLeave)
      document.addEventListener("mousedown", onMouseDown)
      document.addEventListener("mouseup", onMouseUp)
      document.body.addEventListener("mouseover", onMouseOver)
    }

    const removeEventListeners = () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseenter", onMouseEnter)
      document.removeEventListener("mouseleave", onMouseLeave)
      document.removeEventListener("mousedown", onMouseDown)
      document.removeEventListener("mouseup", onMouseUp)
      document.body.removeEventListener("mouseover", onMouseOver)
    }

    addEventListeners()
    return () => removeEventListeners()
  }, [])

  const onMouseMove = (e) => {
    setPosition({ x: e.clientX, y: e.clientY })
  }

  const onMouseEnter = () => {
    setHidden(false)
  }

  const onMouseLeave = () => {
    setHidden(true)
  }

  const onMouseDown = () => {
    setClicked(true)
  }

  const onMouseUp = () => {
    setClicked(false)
  }

  const onMouseOver = (e) => {
    const target = e.target
    if (
      target.tagName.toLowerCase() === "a" ||
      target.tagName.toLowerCase() === "button" ||
      target.onclick != null ||
      target.className.includes("clickable")
    ) {
      setLinkHovered(true)
    } else {
      setLinkHovered(false)
    }
  }

  const cursorClasses = `custom-cursor ${hidden ? "hidden" : ""} ${clicked ? "clicked" : ""} ${linkHovered ? "link-hovered" : ""}`

  return (
    <>
      <div className={cursorClasses} style={{ left: `${position.x}px`, top: `${position.y}px` }} />
      <div className="cursor-trail" style={{ left: `${position.x}px`, top: `${position.y}px` }} />
    </>
  )
}

export default CustomCursor

