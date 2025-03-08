"use client"

import { createContext, useContext, useState, useEffect } from "react"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "../firebase/firebase.config"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Store the user ID in localStorage
        localStorage.setItem("uid", user.uid)

        // Get the ID token and store it in localStorage
        const token = await user.getIdToken()
        localStorage.setItem("authToken", token)

        // Ensure we have a displayName
        if (!user.displayName) {
          try {
            // Try to get user profile from MongoDB to get the displayName
            const response = await axios.get(
              `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/users/${user.uid}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            )

            if (response.data && response.data.user && response.data.user.fullName) {
              // Update the user's displayName in Firebase if we have it in MongoDB
              await updateProfile(user, {
                displayName: response.data.user.fullName,
              })

              // Refresh the user object
              user = auth.currentUser
            }
          } catch (error) {
            console.error("Error fetching user profile:", error)
          }
        }

        setCurrentUser(user)

        try {
          // Get user profile from MongoDB
          const response = await axios.get(
            `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/users/${user.uid}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )

          if (response.data && response.data.user) {
            setUserProfile(response.data.user)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
        }
      } else {
        setCurrentUser(null)
        setUserProfile(null)
        localStorage.removeItem("uid")
        localStorage.removeItem("authToken")
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  // Register a new user
  const register = async (email, password, fullName) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update profile with full name
      await updateProfile(userCredential.user, {
        displayName: fullName,
      })

      // Create user in MongoDB
      const token = await userCredential.user.getIdToken()
      localStorage.setItem("authToken", token)
      localStorage.setItem("uid", userCredential.user.uid)

      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/users`,
        {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          fullName: fullName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      return userCredential.user
    } catch (error) {
      throw error
    }
  }

  // Login user
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Store the user ID and token in localStorage
      localStorage.setItem("uid", userCredential.user.uid)
      const token = await userCredential.user.getIdToken()
      localStorage.setItem("authToken", token)

      return userCredential
    } catch (error) {
      throw error
    }
  }

  // Logout user
  const logout = async () => {
    try {
      await signOut(auth)
      // Clear any local storage items
      localStorage.removeItem("authToken")
      localStorage.removeItem("uid")

      // Set current user and profile to null
      setCurrentUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  // Update user profile in MongoDB
  const updateUserProfile = async (data) => {
    if (!currentUser) throw new Error("No authenticated user")

    try {
      const token = await currentUser.getIdToken()
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/users/${currentUser.uid}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      setUserProfile({ ...userProfile, ...data })
      return response.data
    } catch (error) {
      throw error
    }
  }

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

