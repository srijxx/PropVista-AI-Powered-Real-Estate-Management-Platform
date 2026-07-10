const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, unique: true, lowercase: true, trim: true, required: true },
    password:  { type: String, required: true },
    firstName: { type: String, trim: true, default: "" },
    lastName:  { type: String, trim: true, default: "" },
    username:  { type: String, trim: true, default: "" },
    phone:     { type: String, trim: true, default: "" },
    birth:     { type: Date },
    gender:    { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
    avatar:    { type: String, default: "" },
  },
  { timestamps: true }
);

// unique: true on the field already creates an index — no need for explicit userSchema.index({ email: 1 })
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
