const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userName: String,
  category: { type: String, default: "general" },
  rating: { type: Number, min: 1, max: 5 },
  message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
