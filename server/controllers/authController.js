/**
 * authController.js
 * -----------------
 * Centralised auth logic. Routes in routes/auth.js call these handlers.
 * Using bcryptjs (pure JS) exclusively — no native bcrypt binding needed.
 */

const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const User   = require("../models/User");

// ─── HELPER ──────────────────────────────────────────────────────────────────
// Verify a plain-text password against the stored hash.
// Auto-migrates old native-bcrypt hashes to bcryptjs on first successful login.
async function verifyPassword(user, plainPassword) {
  // Primary check — bcryptjs handles both $2a$ and $2b$ hash prefixes
  const match = await bcrypt.compare(plainPassword, user.password);
  if (match) return true;

  // Fallback — try native bcrypt if installed (for accounts created before migration)
  try {
    const nativeBcrypt = require("bcrypt");
    const fallback = await nativeBcrypt.compare(plainPassword, user.password);
    if (fallback) {
      // Re-save with bcryptjs so all future logins use the pure-JS library
      user.password = await bcrypt.hash(plainPassword, 10);
      await user.save();
      console.log(`[auth] Migrated password hash to bcryptjs for: ${user.email}`);
      return true;
    }
  } catch (_) {
    // native bcrypt not installed — skip
  }

  return false;
}

// ─── SIGN HELPER ─────────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ─── REGISTER ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validate
    if (!name || !name.trim())
      return res.status(400).json({ message: "Name is required" });
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return res.status(400).json({ message: "Valid email is required" });
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name:     name.trim(),
      username: (username || name).trim(),
      email:    normalizedEmail,
      password: hashedPassword,
    });
    await user.save();

    const token = signToken(user);

    res.json({
      message: "Registered successfully",
      token,
      userId: user._id.toString(),
      name:   user.name,
    });
  } catch (err) {
    console.error("[register]", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user)
      return res.status(400).json({ message: "No account found with that email" });

    const isMatch = await verifyPassword(user, password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect password" });

    const token = signToken(user);

    res.json({
      message: "Login successful",
      token,
      userId: user._id.toString(),
      name:   user.name,
    });
  } catch (err) {
    console.error("[login]", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword)
      return res.status(400).json({ message: "Email and new password are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user)
      return res.status(404).json({ message: "No account found with that email" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("[resetPassword]", err.message);
    res.status(500).json({ message: err.message });
  }
};
