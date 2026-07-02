const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: String,
    type: String,
    location: String,
    price: Number,
    bedrooms: Number,
    bathrooms: Number,
    area: Number,

    // For Sale / For Rent
    status: String,

    // Map location
    lat: Number,
    lng: Number,

    // Owner contact — populated from logged-in user at creation
    ownerName: { type: String, default: "Property Owner" },
    ownerPhone: { type: String, default: "9000000000" },
    ownerEmail: { type: String, default: "owner@demo.com" },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Visibility
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },

    image: String
  },
  {
    timestamps: true // ✅ Added On / Updated On
  }
);

module.exports =
  mongoose.models.Property ||
  mongoose.model("Property", propertySchema);
