import express from "express"
import User from "../models/User.js"

const router = express.Router()

// Create a new user
router.post("/", async (req, res) => {
  try {
    const { uid, email, fullName } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ uid })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      })
    }

    // Create new user
    const newUser = new User({
      uid,
      email,
      fullName,
    })

    await newUser.save()

    res.status(201).json({
      success: true,
      user: newUser,
    })
  } catch (error) {
    console.error("Error creating user:", error)
    res.status(500).json({
      success: false,
      message: "Server error while creating user",
      error: error.message,
    })
  }
})

// Get user by uid
router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params

    const user = await User.findOne({ uid })

    if (!user) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      exists: true,
      user,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching user",
      error: error.message,
    })
  }
})

// Update user
router.put("/:uid", async (req, res) => {
  try {
    const { uid } = req.params
    const updateData = req.body

    const user = await User.findOne({ uid })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update user fields
    Object.keys(updateData).forEach((key) => {
      user[key] = updateData[key]
    })

    await user.save()

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({
      success: false,
      message: "Server error while updating user",
      error: error.message,
    })
  }
})

export default router

