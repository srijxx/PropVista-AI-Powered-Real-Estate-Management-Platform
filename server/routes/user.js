const express = require("express");
const router = express.Router();
const User = require("../models/User");
const upload = require("../middleware/upload");
const auth = require("../middleware/authMiddleware");

// GET PROFILE
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE PROFILE — auth required, can only update own profile
router.put("/profile/:id", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    const { firstName, lastName, username, phone, birth, gender } = req.body;

    // basic validation
    if (firstName && firstName.trim().length < 1) {
      return res.status(400).json({ message: "First name cannot be empty" });
    }
    if (phone && !/^\d{7,15}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    const allowed = { firstName, lastName, username, phone, birth, gender };
    // strip undefined keys
    Object.keys(allowed).forEach((k) => allowed[k] === undefined && delete allowed[k]);

    const user = await User.findByIdAndUpdate(req.params.id, allowed, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPLOAD AVATAR — auth required, own profile only
router.post("/profile/:id/avatar", auth, upload.single("avatar"), async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: req.file.filename },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
