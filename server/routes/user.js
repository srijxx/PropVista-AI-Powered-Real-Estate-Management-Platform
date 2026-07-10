/**
 * routes/user.js
 * --------------
 * User profile management — read, update, avatar upload, delete account.
 * All routes require a valid JWT (auth middleware).
 *
 * Avatar uploads go to the Cloudinary folder "propvista/avatars" (separate
 * from property images which use "propvista/properties").
 */

const express    = require("express");
const router     = express.Router();
const multer     = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const User       = require("../models/User");
const auth       = require("../middleware/authMiddleware");

// ─── Avatar-specific Cloudinary storage ──────────────────────────────────────
// Keeps avatars in their own folder and resizes to a square thumbnail
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "propvista/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 300, height: 300, crop: "fill", quality: "auto" }],
  },
});
const uploadAvatar = multer({ storage: avatarStorage });

// ─── GET PROFILE ─────────────────────────────────────────────────────────────
// Auth required — users should only read their own profile.
// (Placing auth here also prevents email/phone scraping)
router.get("/profile/:id", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: "Not authorized to view this profile" });

    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPDATE PROFILE ───────────────────────────────────────────────────────────
router.put("/profile/:id", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: "Not authorized to update this profile" });

    const { firstName, lastName, username, phone, birth, gender } = req.body;

    // Validation
    if (firstName !== undefined && !firstName.trim())
      return res.status(400).json({ message: "First name cannot be empty" });
    if (phone !== undefined && !/^\+?\d{7,15}$/.test(phone.trim()))
      return res.status(400).json({ message: "Invalid phone number (7-15 digits)" });

    // Only update fields that were actually sent
    const updates = {};
    if (firstName !== undefined) updates.firstName = firstName.trim();
    if (lastName  !== undefined) updates.lastName  = lastName.trim();
    if (username  !== undefined) updates.username  = username.trim();
    if (phone     !== undefined) updates.phone     = phone.trim();
    if (birth     !== undefined) updates.birth     = birth;
    if (gender    !== undefined) updates.gender    = gender;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPLOAD AVATAR ────────────────────────────────────────────────────────────
router.post("/profile/:id/avatar", auth, uploadAvatar.single("avatar"), async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: "Not authorized" });
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    // Cloudinary storage: secure URL is on req.file.path
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: req.file.path },
      { new: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE ACCOUNT ───────────────────────────────────────────────────────────
router.delete("/profile/:id", auth, async (req, res) => {
  try {
    if (req.user.id !== req.params.id)
      return res.status(403).json({ message: "Not authorized to delete this account" });

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
