const express  = require("express");
const router   = express.Router();
const Review   = require("../models/Review");
const auth     = require("../middleware/authMiddleware");

// ─── GET ALL REVIEWS FOR A PROPERTY ──────────────────────────────────────────
// GET /api/reviews/:propertyId
router.get("/:propertyId", async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .sort({ createdAt: -1 })
      .lean();

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating   = reviews.length ? (totalRating / reviews.length).toFixed(1) : 0;

    // Star distribution (5 → 1)
    const distribution = [5, 4, 3, 2, 1].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
    }));

    res.json({ reviews, avgRating: Number(avgRating), totalCount: reviews.length, distribution });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── SUBMIT OR UPDATE A REVIEW (auth required) ────────────────────────────────
// POST /api/reviews/:propertyId
router.post("/:propertyId", auth, async (req, res) => {
  try {
    const { rating, comment, userName } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    // Upsert — one review per user per property
    const review = await Review.findOneAndUpdate(
      { property: req.params.propertyId, user: req.user.id },
      {
        property:  req.params.propertyId,
        user:      req.user.id,
        userName:  userName || "Anonymous",
        rating,
        comment:   comment?.trim() || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE OWN REVIEW (auth required) ───────────────────────────────────────
// DELETE /api/reviews/:propertyId
router.delete("/:propertyId", auth, async (req, res) => {
  try {
    const deleted = await Review.findOneAndDelete({
      property: req.params.propertyId,
      user:     req.user.id,
    });
    if (!deleted)
      return res.status(404).json({ message: "No review found to delete" });
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
