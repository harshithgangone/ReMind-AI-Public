import mongoose from "mongoose"

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  audioUrl: {
    type: String,
  },
})

const callSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "ended"],
    default: "active",
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  endedAt: {
    type: Date,
  },
})

// Update the updatedAt field on save
callSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const Call = mongoose.model("Call", callSchema)

export default Call

