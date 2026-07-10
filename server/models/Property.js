const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    type:       { type: String, enum: ["Apartment", "House", "Villa", "Flat"], default: "Apartment" },
    location:   { type: String, required: true, trim: true },
    price:      { type: Number, min: 0, default: 0 },
    bedrooms:   { type: Number, min: 0, default: 0 },
    bathrooms:  { type: Number, min: 0, default: 0 },
    area:       { type: Number, min: 0, default: 0 },
    status:     { type: String, enum: ["For Sale", "For Rent"], default: "For Sale" },
    lat:        { type: Number },
    lng:        { type: Number },
    ownerName:  { type: String, default: "Property Owner", trim: true },
    ownerPhone: { type: String, default: "9000000000", trim: true },
    ownerEmail: { type: String, default: "owner@demo.com", trim: true },
    addedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    published:  { type: Boolean, default: true },
    featured:   { type: Boolean, default: false },
    image:      { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes for common search/filter patterns
propertySchema.index({ location: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ addedBy: 1 });
propertySchema.index({ createdAt: -1 });

module.exports = mongoose.models.Property || mongoose.model("Property", propertySchema);
