"use client"

import { useEffect, useRef, forwardRef } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, Html } from "@react-three/drei"
import { gsap } from "gsap"
import "./IntroAnimation.css"

// Convert Human to use forwardRef
const Human = forwardRef(({ position = [0, -1, 0] }, ref) => {
  return (
    <mesh ref={ref} position={position} scale={[0.8, 0.8, 0.8]}>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color="#6a8caf" />
    </mesh>
  )
})

// Convert AI to use forwardRef
const AI = forwardRef(({ position = [2, -1, 0] }, ref) => {
  return (
    <mesh ref={ref} position={position} scale={[0.8, 0.8, 0.8]}>
      <sphereGeometry args={[0.7, 32, 32]} />
      <meshStandardMaterial color="#a6c1ee" emissive="#a6c1ee" emissiveIntensity={0.3} />
    </mesh>
  )
})

function Connection({ startRef, endRef }) {
  const ref = useRef()

  useEffect(() => {
    // Only run animation if both refs are initialized
    if (!startRef.current || !endRef.current || !ref.current) return

    const animate = () => {
      if (!ref.current || !startRef.current || !endRef.current) return

      const startPos = startRef.current.position
      const endPos = endRef.current.position

      if (!startPos || !endPos) return

      // Update the position and scale of the connection
      ref.current.position.set((startPos.x + endPos.x) / 2, (startPos.y + endPos.y) / 2, (startPos.z + endPos.z) / 2)

      // Look at the end position
      ref.current.lookAt(endPos)

      // Calculate the distance
      const distance = Math.sqrt(
        Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y - startPos.y, 2) + Math.pow(endPos.z - startPos.z, 2),
      )

      // Update the scale
      ref.current.scale.set(0.1, 0.1, distance)
    }

    animate()

    // Animation loop
    const interval = setInterval(animate, 16)
    return () => clearInterval(interval)
  }, [startRef, endRef])

  return (
    <mesh ref={ref}>
      <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
      <meshStandardMaterial color="#a6c1ee" emissive="#a6c1ee" emissiveIntensity={0.5} />
    </mesh>
  )
}

function Scene() {
  const humanRef = useRef()
  const aiRef = useRef()

  useEffect(() => {
    // Make sure refs are initialized before animating
    if (!humanRef.current || !aiRef.current) return

    // Animate the camera and models
    const tl = gsap.timeline()

    // Start with models close together
    tl.to(
      humanRef.current.position,
      {
        x: -1,
        duration: 2,
        ease: "power2.inOut",
      },
      0,
    )

    tl.to(
      aiRef.current.position,
      {
        x: 1,
        duration: 2,
        ease: "power2.inOut",
      },
      0,
    )

    // Then zoom out
    tl.to(
      humanRef.current.position,
      {
        x: -2,
        duration: 1.5,
        ease: "power2.inOut",
      },
      2,
    )

    tl.to(
      aiRef.current.position,
      {
        x: 2,
        duration: 1.5,
        ease: "power2.inOut",
      },
      2,
    )
  }, [])

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Human ref={humanRef} />
      <AI ref={aiRef} />
      <Connection startRef={humanRef} endRef={aiRef} />
      <Environment preset="sunset" />
      <Html position={[0, 1, 0]} center>
        <div className="intro-text">
          <h1>ReMind AI</h1>
          <p>Your mental health companion</p>
        </div>
      </Html>
    </>
  )
}

export default function IntroAnimation() {
  return (
    <div className="intro-animation">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Scene />
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  )
}

