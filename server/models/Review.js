const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName:  { type: String, trim: true, default: "Anonymous" },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// One review per user per property
reviewSchema.index({ property: 1, user: 1 }, { unique: true });
reviewSchema.index({ property: 1, createdAt: -1 });

module.exports = mongoose.models.Review || mongoose.model("Review", reviewSchema);
