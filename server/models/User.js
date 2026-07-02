const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: String,
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
