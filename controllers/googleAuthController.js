import admin from "../config/firebase.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body; // from frontend (Firebase client)
    if (!idToken) return res.status(400).json({ error: "Missing Google ID token" });

    // Verify token with Firebase
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decoded;

    // Check if user exists or create new
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: name,
        email,
        password: null, // Google users don't have password
        profilePic: picture,
        provider: "google"
      });
      await user.save();
    }

    // Generate JWT for your backend
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, picture: user.profilePic }
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ error: "Google login failed", details: error.message });
  }
};
