const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

// Optional email service - only load if email is configured
let emailService = null;
try {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    emailService = require('../services/emailService');
  }
} catch (error) {
  console.log('Email service not available:', error.message);
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'intern'
    });

    await user.save();

    // Send email with credentials to user (only if email service is configured)
    if (emailService) {
      try {
        const emailResult = await emailService.sendClientCredentials(
          email, 
          name || email.split('@')[0], 
          password, 
          `${role.charAt(0).toUpperCase() + role.slice(1)} Account`
        );
        if (emailResult.success) {
          console.log(`Credentials email sent to ${email} for role: ${role}`);
        } else {
          console.error(`Failed to send email to ${email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    } else {
      console.log('Email service not configured - skipping email send');
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
