
const express = require("express");
const app = express();

app.use(express.json());

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
