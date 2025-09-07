// backend/models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone:    { type: String }  // 👈 added phone field
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
