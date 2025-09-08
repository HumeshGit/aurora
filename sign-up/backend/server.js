// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const User = require("./models/User");   // 👈 CommonJS require

dotenv.config();

const app = express();

// security middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// connect DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ DB Error:", err));

// signup route
app.post("/signup", [
  body("username").trim().escape().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }).escape(),
  body("phone").optional().trim().escape()   // 👈 validate phone (optional)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, phone } = req.body;  // 👈 include phone

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone    // 👈 save phone too
    });

    await newUser.save();
    res.status(201).json({ message: "✅ User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "❌ Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
