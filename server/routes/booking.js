const express = require("express");
const router  = express.Router();
const Booking = require("../models/Booking");
const auth    = require("../middleware/authMiddleware");

// ─── CREATE BOOKING ───────────────────────────────────────────────────────────
router.post("/", auth, async (req, res) => {
  try {
    const { propertyId, visitDate, visitTime, name, phone, message } = req.body;

    if (!propertyId || !visitDate || !visitTime)
      return res.status(400).json({ message: "Property, date and time are required" });

    // Prevent booking a past date
    const today = new Date().toISOString().split("T")[0];
    if (visitDate < today)
      return res.status(400).json({ message: "Visit date cannot be in the past" });

    const booking = new Booking({
      property: propertyId,
      user: req.user.id,
      visitDate,
      visitTime,
      name:    name    || "",
      phone:   phone   || "",
      message: message || "",
      status: "Upcoming",
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET USER'S OWN BOOKINGS ──────────────────────────────────────────────────
router.get("/my", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("property", "title location type price image")
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── CANCEL BOOKING ───────────────────────────────────────────────────────────
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "Upcoming")
      return res.status(400).json({ message: "Only upcoming bookings can be cancelled" });

    booking.status = "Cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
