const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
import { sendOTP, verifyOTP } from "../controllers/authController.js";
import { googleLogin } from "../controllers/googleAuthController.js";
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "e7c0607a49a80dfe7ed9ff3bb45a4253e66f190de5af2563055ae83f6539c93d";

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Please enter all fields" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ token, user: { id: newUser._id, username, email } });
  } catch (error) {
  console.error("Registration error:", error.message);
  res.status(500).json({ error: "Server error", details: error.message });
}

});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Please enter all fields" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

     // 🚫 If user signed up with Google, prevent password login
    if (user.password === "GOOGLE_AUTH_USER") {
      return res.status(400).json({
        error: "This account was created with Google. Please sign in using Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  }  catch (error) {
  console.error("Login error:", error.message);
  res.status(500).json({ error: "Server error", details: error.message });
}

});

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/google-login", googleLogin);

module.exports = router;
