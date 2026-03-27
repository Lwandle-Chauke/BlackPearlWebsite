import express from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi'; // Import Joi
import User from '../models/User.js'; // Use ES module import
import { protect } from '../middleware/auth.js'; // Use ES module import

const router = express.Router();

// Generate JWT Token
const signToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = signToken(user._id, user.role);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
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
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
// Joi schemas for validation
const registerSchema = Joi.object({
  name: Joi.string().trim().required(),
  surname: Joi.string().trim().required(),
  email: Joi.string().email().trim().lowercase().required(),
  phone: Joi.string().trim().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
  confirmNewPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'New passwords do not match'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required()
});


// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    // Validate request body with Joi
    await registerSchema.validateAsync(req.body);

    const { name, surname, email, phone, password } = req.body;

    console.log('Registration attempt:', { name, surname, email, phone });

    // Check if user already exists
    const existingUser = await User.findOne({ email: email });
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

    // Joi validation error
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email address'
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
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Validate request body with Joi
    await loginSchema.validateAsync(req.body);

    const { email, password } = req.body;

    console.log('Login attempt:', email);

    // Check for user (include password for verification)
    const user = await User.findOne({ email: email }).select('+password');

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

    // Joi validation error
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during login. Please try again.'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    // The protect middleware already verifies the token and attaches the user to req.user
    const user = await User.findById(req.user.id);


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

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, async (req, res) => {
  try {
    console.log('🔐 Change password request received for user:', req.user.email);
    console.log('Request body:', { ...req.body, currentPassword: '***', newPassword: '***', confirmNewPassword: '***' });

    // Validate request body with Joi
    await changePasswordSchema.validateAsync(req.body);

    const { currentPassword, newPassword } = req.body;

    if (currentPassword === newPassword) {
      console.log('❌ New password same as current');
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password'
      });
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if current password is correct
    console.log('🔑 Verifying current password...');
    const isCurrentPasswordCorrect = await user.correctPassword(currentPassword);
    if (!isCurrentPasswordCorrect) {
      console.log('❌ Current password incorrect');
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    console.log('🔄 Updating password...');
    user.password = newPassword;
    await user.save();

    console.log('✅ Password changed successfully for user:', user.email);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);

    // Joi validation error
    if (error.isJoi) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error while changing password: ' + error.message
    });
  }
});

// @desc    Forgot password - generate temporary password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    // Validate request body with Joi
    await forgotPasswordSchema.validateAsync(req.body);

    const { email } = req.body;

    console.log('🔑 Forgot password request for:', email);

    // Check if user exists
    const user = await User.findOne({ email: email });

    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address'
      });
    }

    // Generate temporary password (8 characters: letters and numbers)
    const temporaryPassword = Math.random().toString(36).slice(-8);
    console.log('🔄 Generated temporary password for:', email);

    // Update user's password
    user.password = temporaryPassword;
    await user.save();

    console.log('✅ Temporary password set for user:', email);

    // In a real application, you would send an email here
    // For now, we'll return the temporary password in the response
    res.json({
      success: true,
      message: 'Temporary password generated successfully',
      temporaryPassword: temporaryPassword, // Remove this in production - only for testing
      note: 'In production, this would be sent via email'
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while processing forgot password request: ' + error.message
    });
  }
});
export default router;
