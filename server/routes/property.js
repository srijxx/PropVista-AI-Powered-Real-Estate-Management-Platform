/**
 * routes/property.js
 * ------------------
 * All property CRUD + image upload + toggle endpoints.
 * Protected routes require a valid JWT via authMiddleware.
 */

const express  = require("express");
const router   = express.Router();
const Property = require("../models/Property");
const User     = require("../models/User");
const auth     = require("../middleware/authMiddleware");
const upload   = require("../middleware/upload");

// ─── WHITELIST of fields clients are allowed to set ──────────────────────────
const ALLOWED_FIELDS = [
  "title", "type", "location", "price", "status",
  "bedrooms", "bathrooms", "area", "lat", "lng", "image",
];

function pickAllowed(body) {
  return ALLOWED_FIELDS.reduce((acc, key) => {
    if (body[key] !== undefined) acc[key] = body[key];
    return acc;
  }, {});
}

// ─── GET ALL PROPERTIES ───────────────────────────────────────────────────────
// NOTE: /stats/summary MUST remain above /:id so it is not swallowed
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
router.get("/stats/summary", async (req, res) => {
  try {
    const [total, forSale, forRent, latest] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: "For Sale" }),
      Property.countDocuments({ status: "For Rent" }),
      Property.findOne().sort({ createdAt: -1 }).select("title"),
    ]);
    res.json({ total, forSale, forRent, latest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET PROPERTIES BY LOGGED-IN USER ────────────────────────────────────────
router.get("/mine", auth, async (req, res) => {
  try {
    const properties = await Property.find({ addedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET SINGLE PROPERTY ─────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ADD PROPERTY (protected) ─────────────────────────────────────────────────
router.post("/add", auth, async (req, res) => {
  try {
    const { title, type, location, price } = req.body;

    if (!title || !title.trim())
      return res.status(400).json({ message: "Title is required" });
    if (!location || !location.trim())
      return res.status(400).json({ message: "Location is required" });
    if (!type)
      return res.status(400).json({ message: "Property type is required" });
    if (price !== undefined && (isNaN(price) || Number(price) < 0))
      return res.status(400).json({ message: "Price must be a positive number" });

    // Fetch owner details from the authenticated user
    const user = await User.findById(req.user.id);

    const ownerName = user
      ? (`${user.firstName || ""} ${user.lastName || ""}`.trim() || user.name || user.username || "Property Owner")
      : "Property Owner";

    // Only pick whitelisted fields from req.body — prevents mass-assignment
    const data = {
      ...pickAllowed(req.body),
      addedBy:    req.user.id,
      ownerName,
      ownerPhone: user?.phone  || "9000000000",
      ownerEmail: user?.email  || "owner@demo.com",
    };

    const property = new Property(data);
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPLOAD PROPERTY IMAGE (protected) ────────────────────────────────────────
router.post("/:id/image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    // Cloudinary storage: secure URL is on req.file.path
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { image: req.file.path },
      { new: true }
    );
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    res.json({ image: property.image });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPDATE PROPERTY (protected) ─────────────────────────────────────────────
router.put("/:id", auth, async (req, res) => {
  try {
    const { price } = req.body;
    if (price !== undefined && (isNaN(price) || Number(price) < 0))
      return res.status(400).json({ message: "Price must be a positive number" });

    // Only allow whitelisted fields to be updated
    const updates = pickAllowed(req.body);

    const updated = await Property.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Property not found" });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE PROPERTY (protected) ─────────────────────────────────────────────
router.delete("/:id", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    await property.deleteOne();
    res.json({ message: "Property deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TOGGLE PUBLISHED (protected) ────────────────────────────────────────────
router.patch("/:id/toggle-published", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    property.published = !property.published;
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── TOGGLE FEATURED (protected) ─────────────────────────────────────────────
router.patch("/:id/toggle-featured", auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property)
      return res.status(404).json({ message: "Property not found" });
    property.featured = !property.featured;
    await property.save();
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
