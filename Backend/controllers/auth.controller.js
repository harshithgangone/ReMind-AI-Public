import User from "../models/user.model.js"
import { db } from "../config/firebase.config.js"

// Verify Firebase token and check user in MongoDB
export const verifyUser = async (req, res) => {
  try {
    const { uid, email, name, picture } = req.user

    // Check if user exists in MongoDB
    let user = await User.findById(uid)
    const isNewUser = !user

    if (isNewUser) {
      // Create new user in MongoDB
      user = new User({
        _id: uid,
        email,
        displayName: name,
        photoURL: picture,
      })
      await user.save()
    } else {
      // Update last login time
      user.lastLogin = new Date()
      await user.save()
    }

    // TEMPORARY FIX: Skip Firestore session creation
    /*
    // Create or update session in Firestore
    const sessionRef = db.collection("sessions").doc(uid)
    await sessionRef.set({
      uid,
      email,
      displayName: user.displayName,
      onboardingComplete: user.onboardingComplete,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    })
    */

    return res.status(200).json({
      success: true,
      user: {
        uid,
        email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        occupation: user.occupation,
        workHours: user.workHours,
        sleepHours: user.sleepHours,
        onboardingComplete: user.onboardingComplete,
        preferences: user.preferences,
      },
      isNewUser,
    })
  } catch (error) {
    console.error("User verification error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error during user verification",
    })
  }
}

// Update user onboarding information
export const updateOnboarding = async (req, res) => {
  try {
    const { uid } = req.user
    const { occupation, workHours, sleepHours } = req.body

    // Update user in MongoDB
    const user = await User.findByIdAndUpdate(
      uid,
      {
        occupation,
        workHours,
        sleepHours,
        onboardingComplete: true,
      },
      { new: true },
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // Update session in Firestore
    const sessionRef = db.collection("sessions").doc(uid)
    await sessionRef.update({
      onboardingComplete: true,
    })

    return res.status(200).json({
      success: true,
      user: {
        uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        occupation: user.occupation,
        workHours: user.workHours,
        sleepHours: user.sleepHours,
        onboardingComplete: user.onboardingComplete,
        preferences: user.preferences,
      },
    })
  } catch (error) {
    console.error("Onboarding update error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error during onboarding update",
    })
  }
}

// Modify the logout function to bypass Firestore session deletion
export const logout = async (req, res) => {
  try {
    const { uid } = req.user

    // TEMPORARY FIX: Skip Firestore session deletion
    /*
    // Remove session from Firestore
    await db.collection("sessions").doc(uid).delete()
    */

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Logout error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error during logout",
    })
  }
}

