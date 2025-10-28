
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// Sample GET endpoint
app.get("/api/hello", (req, res) => {
  res.status(200).json({ message: "Hello from Vercel REST API!" });
});


app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello from Vercel REST API!" });
});

// Sample POST endpoint
app.post("/api/echo", (req, res) => {
  res.status(200).json({ youSent: req.body });
});


module.exports = app;
