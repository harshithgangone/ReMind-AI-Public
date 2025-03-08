"use client"

import { useEffect, useState } from "react"
import { Box } from "@mui/material"
import { useThemeContext } from "../context/ThemeContext"

const FloatingObjects = () => {
  const { mode } = useThemeContext()
  const [objects, setObjects] = useState([])

  useEffect(() => {
    const shapes = [
      { type: "circle", size: 80 },
      { type: "triangle", size: 70 },
      { type: "square", size: 60 },
      { type: "circle", size: 100 },
      { type: "triangle", size: 90 },
      { type: "square", size: 50 },
      { type: "circle", size: 120 },
      { type: "triangle", size: 110 },
      { type: "square", size: 70 },
    ]

    const colors =
      mode === "dark"
        ? ["rgba(138, 162, 211, 0.15)", "rgba(156, 137, 184, 0.15)", "rgba(100, 130, 180, 0.15)"]
        : ["rgba(138, 162, 211, 0.25)", "rgba(156, 137, 184, 0.25)", "rgba(100, 130, 180, 0.25)"]

    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    const generateRandomValue = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    const newObjects = shapes.map((shape, index) => {
      // Generate random movement values for each keyframe
      const randomMovement = {
        x1: generateRandomValue(-30, 30),
        y1: generateRandomValue(-30, 30),
        r1: generateRandomValue(-10, 10),
        x2: generateRandomValue(-30, 30),
        y2: generateRandomValue(-30, 30),
        r2: generateRandomValue(-10, 10),
        x3: generateRandomValue(-30, 30),
        y3: generateRandomValue(-30, 30),
        r3: generateRandomValue(-10, 10),
        x4: generateRandomValue(-30, 30),
        y4: generateRandomValue(-30, 30),
        r4: generateRandomValue(-10, 10),
        x5: generateRandomValue(-30, 30),
        y5: generateRandomValue(-30, 30),
        r5: generateRandomValue(-10, 10),
      }

      return {
        ...shape,
        id: index,
        x: Math.random() * windowWidth * 0.8,
        y: Math.random() * windowHeight * 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 15 + Math.random() * 20,
        movement: randomMovement,
      }
    })

    setObjects(newObjects)
  }, [mode])

  const renderShape = (shape) => {
    switch (shape.type) {
      case "circle":
        return (
          <Box
            sx={{
              width: shape.size,
              height: shape.size,
              borderRadius: "50%",
              backgroundColor: shape.color,
            }}
          />
        )
      case "triangle":
        return (
          <Box
            sx={{
              width: 0,
              height: 0,
              borderLeft: `${shape.size / 2}px solid transparent`,
              borderRight: `${shape.size / 2}px solid transparent`,
              borderBottom: `${shape.size}px solid ${shape.color}`,
            }}
          />
        )
      case "square":
        return (
          <Box
            sx={{
              width: shape.size,
              height: shape.size,
              backgroundColor: shape.color,
              borderRadius: "10px",
              transform: "rotate(45deg)",
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {objects.map((obj) => (
        <Box
          key={obj.id}
          className="floating-object"
          sx={{
            position: "absolute",
            left: obj.x,
            top: obj.y,
            "--duration": `${obj.duration}s`,
            "--x1": `${obj.movement.x1}px`,
            "--y1": `${obj.movement.y1}px`,
            "--r1": `${obj.movement.r1}deg`,
            "--x2": `${obj.movement.x2}px`,
            "--y2": `${obj.movement.y2}px`,
            "--r2": `${obj.movement.r2}deg`,
            "--x3": `${obj.movement.x3}px`,
            "--y3": `${obj.movement.y3}px`,
            "--r3": `${obj.movement.r3}deg`,
            "--x4": `${obj.movement.x4}px`,
            "--y4": `${obj.movement.y4}px`,
            "--r4": `${obj.movement.r4}deg`,
            "--x5": `${obj.movement.x5}px`,
            "--y5": `${obj.movement.y5}px`,
            "--r5": `${obj.movement.r5}deg`,
          }}
        >
          {renderShape(obj)}
        </Box>
      ))}
    </>
  )
}

export default FloatingObjects

