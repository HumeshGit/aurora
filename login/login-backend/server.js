import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(cors());               // allow your frontend to call this API
app.use(express.json());       // parse JSON bodies
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "projectsinterface/login/login.html"));
});
// Connect to MongoDB
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log(`API running on http://localhost:${process.env.PORT}`)
    );
  } catch (err) {
    console.error("Mongo connect error:", err.message);
    process.exit(1);
  }
};
start();

/**
 * POST /api/login
 * Body: { username, password }
 * Check if a user document with exact username & password exists.
 * If exists => "good response"
 * If not => "not exist"
 */
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, message: "Missing fields" });
    }
     // Find user by username only
     const user = await User.findOne({ username });
     if (!user) {
       return res.status(404).json({ ok: false, message: "User not found" });
     }
 
     // Compare entered password with hashed password in DB
     const isMatch = await bcrypt.compare(password, user.password);
     if (!isMatch) {
       return res.status(401).json({ ok: false, message: "Invalid password" });
     }
     // Success
    res.status(200).json({ ok: true, message: "Login successful" });

  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, message: "server error" });
  }
});

/**
 * (Optional) Seed route to create a test user quickly
 * POST /api/seed { username, password }
 */
app.post("/api/seed", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ ok: false, message: "Missing fields" });
    const user = await User.create({ username, password });
    res.json({ ok: true, user });
  } catch (e) {
    res.status(500).json({ ok: false, message: e.message });
  }
});
