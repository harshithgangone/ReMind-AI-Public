import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Using Firebase UID as primary key
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    photoURL: {
      type: String,
    },
    occupation: {
      type: String,
    },
    workHours: {
      type: Number,
    },
    sleepHours: {
      type: Number,
    },
    onboardingComplete: {
      type: Boolean,
      default: false,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "dark",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
) // Disable auto-generation of _id

const User = mongoose.model("User", userSchema)

export default User

