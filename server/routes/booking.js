const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const auth = require("../middleware/authMiddleware");

// Create booking
router.post("/", auth, async (req, res) => {
  try {
    const { propertyId, visitDate, visitTime, name, phone, message } = req.body;
    if (!propertyId || !visitDate || !visitTime)
      return res.status(400).json({ message: "Property, date and time are required" });
    const booking = new Booking({
      property: propertyId, user: req.user.id,
      visitDate, visitTime, name, phone, message, status: "Upcoming"
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get bookings for logged-in user
router.get("/my", auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("property").sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Cancel booking
router.patch("/:id/cancel", auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = "Cancelled";
    await booking.save();
    res.json(booking);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
