const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,       // used at registration
    email: { type: String, unique: true, lowercase: true },
    password: String,

    firstName: String,
    lastName: String,
    username: String,
    phone: String,
    birth: Date,
    gender: String,
    avatar: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
