const express = require("express");
const router = express.Router();
const ContactModel = require("../models/Contact");

// Submit contact message
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }
    const contact = new ContactModel({ name, email, subject, message });
    await contact.save();
    res.status(201).json({ message: "Message received! We'll respond within 24 hours." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all contact messages (admin)
router.get("/", async (req, res) => {
  try {
    const messages = await ContactModel.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
