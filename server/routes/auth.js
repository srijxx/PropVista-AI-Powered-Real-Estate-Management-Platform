/**
 * routes/auth.js
 * --------------
 * All auth endpoints delegate to authController for clean separation.
 * Handlers live in controllers/authController.js.
 */

const express = require("express");
const router  = express.Router();

const { register, login, resetPassword } = require("../controllers/authController");

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

module.exports = router;
