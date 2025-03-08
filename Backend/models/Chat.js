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
  isVoice: {
    type: Boolean,
    default: false,
  },
})

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
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
})

// Update the updatedAt field on save
chatSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const Chat = mongoose.model("Chat", chatSchema)

export default Chat

