const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    property:  { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    user:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    visitDate: { type: String, required: true },
    visitTime: { type: String, required: true },
    status:    { type: String, enum: ["Upcoming", "Completed", "Cancelled"], default: "Upcoming" },
    name:      { type: String, trim: true, default: "" },
    phone:     { type: String, trim: true, default: "" },
    message:   { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ property: 1 });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
