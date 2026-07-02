const express = require("express");
const router = express.Router();
const FeedbackModel = require("../models/Feedback");

// Submit feedback (any user, no auth required)
router.post("/", async (req, res) => {
  try {
    const { category, rating, message, userName, userId } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Message is required" });
    const fb = new FeedbackModel({ category, rating, message, userName, userId });
    await fb.save();
    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all feedback (admin)
router.get("/", async (req, res) => {
  try {
    const feedbacks = await FeedbackModel.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
