require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors'); // ✅ import CORS
const nodemailer = require('nodemailer');

const app = express();

// ======================
// Middleware (must be BEFORE routes)
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

// Test routes
app.get('/', (req, res) => res.send('Backend with Express is working'));
app.get('/about', (req, res) => res.send('This is my backend API'));

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "1234") {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

app.get('/test-login', (req, res) => {
  res.json({ message: "POST /login is ready (needs proper tool to test)" });
});

app.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  const code = Math.floor(100000 + Math.random() * 900000);
  resetCodes[email] = code;

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
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to send email' });
  }
});

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