"use client"

import { useRef, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import { Vector3 } from "three"
import "./GuideCharacter.css"

const GuideCharacter = ({ position = [3, -1.5, 0], message = "Hi! I'm your guide. How can I help you today?" }) => {
  const ref = useRef()
  const messageRef = useRef()
  const targetPosition = useRef(new Vector3(...position))

  // Floating animation
  useFrame((state) => {
    if (ref.current) {
      // Gentle floating motion
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1

      // Gentle rotation
      ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  useEffect(() => {
    // Show message after a delay
    const timer = setTimeout(() => {
      if (messageRef.current) {
        messageRef.current.classList.add("visible")
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <group ref={ref} position={position}>
      {/* Simple 3D character */}
      <mesh scale={[0.6, 0.6, 0.6]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#a6c1ee" emissive="#a6c1ee" emissiveIntensity={0.2} />
      </mesh>

      {/* Character body */}
      <mesh position={[0, -0.7, 0]} scale={[0.4, 0.5, 0.4]}>
        <capsuleGeometry args={[0.5, 1, 4, 8]} />
        <meshStandardMaterial color="#8ca9d3" />
      </mesh>

      {/* Character eyes */}
      <mesh position={[0.15, 0.1, 0.4]} scale={[0.08, 0.08, 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-0.15, 0.1, 0.4]} scale={[0.08, 0.08, 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Character pupils */}
      <mesh position={[0.15, 0.1, 0.48]} scale={[0.04, 0.04, 0.04]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      <mesh position={[-0.15, 0.1, 0.48]} scale={[0.04, 0.04, 0.04]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Message bubble */}
      <Html position={[1, 1, 0]} center>
        <div ref={messageRef} className="guide-message">
          {message}
        </div>
      </Html>
    </group>
  )
}

export default GuideCharacter

