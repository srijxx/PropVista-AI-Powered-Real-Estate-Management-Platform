const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  visitDate: { type: String, required: true },
  visitTime: { type: String, required: true },
  status: { type: String, enum: ["Upcoming","Completed","Cancelled"], default: "Upcoming" },
  name: String,
  phone: String,
  message: String,
}, { timestamps: true });

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
