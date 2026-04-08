require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();

// ======================
// Middleware
// ======================
app.use(cors()); // allow requests from any origin
app.use(express.json()); // parse JSON bodies

// ======================
// In-memory storage
// ======================
const resetCodes = {}; // { email: code }

// ======================
// Routes
// ======================

// Test route
app.get('/', (req, res) => {
  res.send('Backend with Express is working');
});

app.get('/about', (req, res) => {
  res.send('This is my backend API');
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    res.json({ success: true, message: "Login successful", role: "teacher" });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

// Test login route
app.get('/test-login', (req, res) => {
  res.json({ message: "POST /login is ready (needs proper tool to test)" });
});

// Request password reset
app.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000);
  resetCodes[email] = code;

  // Check if environment variables for email exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("EMAIL_USER or EMAIL_PASS not set. Skipping email send.");
    return res.json({ success: true, message: 'Reset code generated (email skipped for testing)' });
  }

  // Configure Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Code',
    text: `Your password reset code is: ${code}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Reset code sent to email' });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

// Reset password route
app.post('/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, code, and new password are required' });
  }

  if (resetCodes[email] && resetCodes[email] == code) {
    delete resetCodes[email]; // remove used code
    res.json({ success: true, message: 'Password has been reset successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid code or email' });
  }
});

// ======================
// Start server
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));