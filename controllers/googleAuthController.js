import admin from "../config/firebase.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 🔹 Google Login Controller
export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken)
      return res.status(400).json({ error: "Missing Google ID token" });

    // ✅ Verify Google ID token using Firebase Admin
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name } = decoded;

    if (!email)
      return res.status(400).json({ error: "Email not found in Google account" });

    // ✅ Check if user exists in MongoDB
    let user = await User.findOne({ email });

    // ✅ If user doesn't exist, create new one
    if (!user) {
      user = new User({
        username: name || email.split("@")[0],
        email,
        password: "GOOGLE_AUTH_USER", // placeholder
      });
      await user.save();
    }

    // ✅ Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // ✅ Send back same structure as your normal login
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res
      .status(500)
      .json({ error: "Google login failed", details: error.message });
  }
};
