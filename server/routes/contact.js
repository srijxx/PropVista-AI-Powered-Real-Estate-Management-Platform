const express      = require("express");
const router       = express.Router();
const ContactModel = require("../models/Contact");

// Basic email regex
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── SUBMIT CONTACT MESSAGE ───────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name  || !name.trim())   return res.status(400).json({ message: "Name is required" });
    if (!email || !EMAIL_RE.test(email.trim())) return res.status(400).json({ message: "Valid email is required" });
    if (!message || !message.trim()) return res.status(400).json({ message: "Message is required" });

    const contact = new ContactModel({
      name:    name.trim(),
      email:   email.trim().toLowerCase(),
      subject: subject?.trim() || "",
      message: message.trim(),
    });
    await contact.save();
    res.status(201).json({ message: "Message received! We'll respond within 24 hours." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET ALL MESSAGES (admin) ─────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const messages = await ContactModel.find().sort({ createdAt: -1 }).lean();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
