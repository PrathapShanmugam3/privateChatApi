import admin from "../config/firebase";
import jwt from "jsonwebtoken";

const otpStore = {}; // temporary (replace with Redis or DB for production)

// Step 1: Send OTP
export const sendOTP = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Phone number required" });

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP temporarily (5 min expiry)
    otpStore[phoneNumber] = { otp, expires: Date.now() + 5 * 60 * 1000 };

    console.log(`OTP for ${phoneNumber}: ${otp}`); // 🔥 remove in prod, integrate SMS API

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};



// Step 2: Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const data = otpStore[phoneNumber];

    if (!data) return res.status(400).json({ error: "OTP not found or expired" });
    if (Date.now() > data.expires) return res.status(400).json({ error: "OTP expired" });
    if (otp !== data.otp) return res.status(400).json({ error: "Invalid OTP" });

    // OTP verified — generate JWT
    const token = jwt.sign({ phoneNumber }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // delete used OTP
    delete otpStore[phoneNumber];

    const user = { phoneNumber }; // you can also fetch from DB

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OTP verification failed" });
  }
};
