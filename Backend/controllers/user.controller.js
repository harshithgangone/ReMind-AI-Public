import User from "../models/user.model.js"

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { uid } = req.user

    // TEMPORARY FIX: Skip Firestore cache check
    /*
    // Check if user data is in Firestore cache
    const cacheRef = db.collection("userCache").doc(uid)
    const cacheDoc = await cacheRef.get()

    if (cacheDoc.exists) {
      const cachedData = cacheDoc.data()
      return res.status(200).json({
        success: true,
        user: cachedData,
        source: "cache",
      })
    }
    */

    // Get user from MongoDB
    const user = await User.findById(uid)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const userData = {
      uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      occupation: user.occupation,
      workHours: user.workHours,
      sleepHours: user.sleepHours,
      onboardingComplete: user.onboardingComplete,
      preferences: user.preferences,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }

    // TEMPORARY FIX: Skip Firestore cache update
    /*
    // Cache user data in Firestore
    await cacheRef.set(userData, { merge: true })
    */

    return res.status(200).json({
      success: true,
      user: userData,
      source: "database",
    })
  } catch (error) {
    console.error("Get user profile error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user profile",
    })
  }
}

// Modify the updateUserPreferences function to bypass Firestore cache update
export const updateUserPreferences = async (req, res) => {
  try {
    const { uid } = req.user
    const { preferences } = req.body

    // Update user in MongoDB
    const user = await User.findByIdAndUpdate(uid, { preferences }, { new: true })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // TEMPORARY FIX: Skip Firestore cache update
    /*
    // Update cache in Firestore
    await db.collection("userCache").doc(uid).update({ preferences })
    */

    return res.status(200).json({
      success: true,
      preferences: user.preferences,
    })
  } catch (error) {
    console.error("Update preferences error:", error)
    return res.status(500).json({
      success: false,
      message: "Server error while updating preferences",
    })
  }
}

