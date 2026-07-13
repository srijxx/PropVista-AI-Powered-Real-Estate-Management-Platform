const express  = require("express");
const router   = express.Router();
const Booking  = require("../models/Booking");
const Property = require("../models/Property");
const User     = require("../models/User");
const auth     = require("../middleware/authMiddleware");
const {
  sendOwnerBookingNotification,
  sendVisitorBookingConfirmation,
  sendCancellationEmail,
} = require("../utils/mailer");

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

    // Save booking
    const booking = new Booking({
      property: propertyId,
      user:     req.user.id,
      visitDate,
      visitTime,
      name:    name    || "",
      phone:   phone   || "",
      message: message || "",
      status:  "Upcoming",
    });
    await booking.save();

    // ── SEND EMAILS (non-blocking — never crash the booking if email fails) ──
    // Fetch property and visitor user details for the emails
    setImmediate(async () => {
      try {
        const [property, visitor] = await Promise.all([
          Property.findById(propertyId).lean(),
          User.findById(req.user.id).select("name email").lean(),
        ]);

        if (!property || !visitor) return;

        console.log("[booking:diag] property.ownerEmail =", JSON.stringify(property.ownerEmail));
        console.log("[booking:diag] property.ownerName  =", JSON.stringify(property.ownerName));
        console.log("[booking:diag] visitor.email       =", JSON.stringify(visitor.email));

        const visitorName  = name  || visitor.name  || "Visitor";
        const visitorPhone = phone || "Not provided";
        const visitorEmail = visitor.email;

        const recipientEmail =
          property.ownerEmail && property.ownerEmail !== "owner@demo.com"
            ? property.ownerEmail
            : process.env.EMAIL_USER;

        console.log("[booking:diag] recipientEmail      =", JSON.stringify(recipientEmail));
        console.log("[booking:diag] EMAIL_USER           =", JSON.stringify(process.env.EMAIL_USER));

        if (recipientEmail) {
          await sendOwnerBookingNotification({
            ownerEmail:       recipientEmail,
            ownerName:        property.ownerName,
            visitorName,
            visitorPhone,
            visitorEmail,
            propertyTitle:    property.title,
            propertyLocation: property.location,
            propertyType:     property.type,
            propertyPrice:    property.price,
            visitDate,
            visitTime,
            message:          message || "",
            bookingId:        booking._id.toString(),
          });
        }

        // 2. Confirmation email → Visitor
        if (visitorEmail) {
          await sendVisitorBookingConfirmation({
            visitorEmail,
            visitorName,
            propertyTitle:    property.title,
            propertyLocation: property.location,
            propertyType:     property.type,
            propertyPrice:    property.price,
            ownerName:        property.ownerName,
            ownerPhone:       property.ownerPhone,
            ownerEmail:       property.ownerEmail,
            visitDate,
            visitTime,
            bookingId:        booking._id.toString(),
          });
        }
      } catch (emailErr) {
        console.error("[booking] Email error:", emailErr.message);
      }
    });

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
      _id:  req.params.id,
      user: req.user.id,
    });
    if (!booking)
      return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "Upcoming")
      return res.status(400).json({ message: "Only upcoming bookings can be cancelled" });

    booking.status = "Cancelled";
    await booking.save();

    // ── SEND CANCELLATION EMAILS (non-blocking) ──────────────────────────────
    setImmediate(async () => {
      try {
        const [property, visitor] = await Promise.all([
          Property.findById(booking.property).lean(),
          User.findById(req.user.id).select("name email").lean(),
        ]);

        if (!property || !visitor) return;

        const cancelledBy = booking.name || visitor.name || "Visitor";

        // Notify owner (fall back to admin if no real owner email)
        const ownerRecipient =
          property.ownerEmail && property.ownerEmail !== "owner@demo.com"
            ? property.ownerEmail
            : process.env.EMAIL_USER;

        if (ownerRecipient) {
          await sendCancellationEmail({
            toEmail:       ownerRecipient,
            toName:        property.ownerName,
            role:          "owner",
            propertyTitle: property.title,
            visitDate:     booking.visitDate,
            visitTime:     booking.visitTime,
            cancelledBy,
          });
        }

        // Notify visitor
        if (visitor.email) {
          await sendCancellationEmail({
            toEmail:       visitor.email,
            toName:        booking.name || visitor.name,
            role:          "visitor",
            propertyTitle: property.title,
            visitDate:     booking.visitDate,
            visitTime:     booking.visitTime,
            cancelledBy,
          });
        }
      } catch (emailErr) {
        console.error("[booking/cancel] Email error:", emailErr.message);
      }
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
