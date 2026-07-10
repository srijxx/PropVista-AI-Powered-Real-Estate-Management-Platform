const express       = require("express");
const router        = express.Router();
const FeedbackModel = require("../models/Feedback");

// ─── SUBMIT FEEDBACK ──────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { category, rating, message, userName, userId } = req.body;

    if (!message || !message.trim())
      return res.status(400).json({ message: "Feedback message is required" });
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    const fb = new FeedbackModel({
      category: category || "general",
      rating,
      message:  message.trim(),
      userName: userName || "Anonymous",
      userId:   userId   || undefined,
    });
    await fb.save();
    res.status(201).json({ message: "Feedback submitted successfully. Thank you!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET ALL FEEDBACK (admin use) ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const feedbacks = await FeedbackModel.find().sort({ createdAt: -1 }).lean();
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
