const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Generate JWT Token
const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = signToken(user._id);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, surname, email, phone, password, confirmPassword } = req.body;

    console.log('Registration attempt:', { name, surname, email, phone });

    // Validation
    if (!name || !surname || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email address'
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      surname: surname.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password
    });

    console.log('User created successfully:', user.email);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Registration error:', error);

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email address'
      });
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during registration. Please try again.'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', email);

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user (include password for verification)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if password matches - USING FIXED METHOD
    const isMatch = await user.correctPassword(password);

    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log('Login successful for user:', user.email);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login. Please try again.'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

module.exports = router;