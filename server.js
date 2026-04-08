require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
app.use(cors()); // allow all origins (for testing)

const app = express();

app.use(express.json());

// middleware (important for later)
app.use(express.json());

const nodemailer = require('nodemailer');

// In-memory storage for reset codes
const resetCodes = {}; // { email: code }

// test route
app.get('/', (req, res) => {
  res.send('Backend with Express is working');
});

app.get('/about', (req, res) => {
  res.send('This is my backend API');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "1234") {
    res.json({ success: true, message: "Login successful" });
  } else {
    res.json({ success: false, message: "Invalid credentials" });
  }
});

app.get('/test-login', (req, res) => {
  res.json({
    message: "POST /login is ready (needs proper tool to test)"
  });
});

app.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000);
  resetCodes[email] = code; // save code in memory

  // Configure transporter
  let transporter = nodemailer.createTransport({
    service: 'gmail', // or outlook, etc.
    auth: {
      user: process.env.EMAIL_USER, // use environment variable for security
      pass: process.env.EMAIL_PASS // use environment variable for security 
    }
  });

  // Email content
  let mailOptions = {
    from: process.env.EMAIL_USER, // use environment variable for security
    to: email,             // recipient 
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

  // Check if the code matches
  if (resetCodes[email] && resetCodes[email] == code) {
    // Password reset logic (for now just a message; later save to DB)
    delete resetCodes[email]; // remove used code
    res.json({ success: true, message: 'Password has been reset successfully' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid code or email' });
  }
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});