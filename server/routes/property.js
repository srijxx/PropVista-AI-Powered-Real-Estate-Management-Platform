const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ✅ GET ALL PROPERTIES
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 📊 DASHBOARD STATS
router.get("/stats/summary", async (req, res) => {
  try {
    const total = await Property.countDocuments();
    const forSale = await Property.countDocuments({ status: "For Sale" });
    const forRent = await Property.countDocuments({ status: "For Rent" });

    const latest = await Property.findOne()
      .sort({ createdAt: -1 })
      .select("title");

    res.json({ total, forSale, forRent, latest });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET SINGLE PROPERTY
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ ADD PROPERTY (protected)
router.post("/add", auth, async (req, res) => {
  try {
    const { title, type, location, price, status } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ message: "Title is required" });
    if (!location || !location.trim()) return res.status(400).json({ message: "Location is required" });
    if (!type) return res.status(400).json({ message: "Property type is required" });
    if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    const User = require("../models/User");
    const user = await User.findById(req.user.id);

    const property = new Property({
      ...req.body,
      addedBy: req.user.id,
      ownerName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "Property Owner" : "Property Owner",
      ownerPhone: user?.phone || "9000000000",
      ownerEmail: user?.email || "owner@demo.com"
    });
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPLOAD PROPERTY IMAGE (protected) — stored on Cloudinary CDN
router.post("/:id/image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    // Cloudinary storage puts the secure URL on req.file.path
    const imageUrl = req.file.path;
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { image: imageUrl },
      { new: true }
    );
    res.json({ image: property.image });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ UPDATE PROPERTY (protected)
router.put("/:id", auth, async (req, res) => {
  try {
    const { price } = req.body;
    if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }
    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Property not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ DELETE PROPERTY (protected)
router.delete("/:id", auth, async (req, res) => {
  await Property.findByIdAndDelete(req.params.id);
  res.json({ message: "Property deleted" });
});

// TOGGLE PUBLISHED (protected)
router.patch("/:id/toggle-published", auth, async (req, res) => {
  const property = await Property.findById(req.params.id);
  property.published = !property.published;
  await property.save();
  res.json(property);
});

// TOGGLE FEATURED (protected)
router.patch("/:id/toggle-featured", auth, async (req, res) => {
  const property = await Property.findById(req.params.id);
  property.featured = !property.featured;
  await property.save();
  res.json(property);
});

module.exports = router;
