const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Test route
router.get('/profile/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Profile route is working!',
    timestamp: new Date().toISOString()
  });
});

// Profile update route
router.post('/profile/update', protect, upload.single('profileImage'), async (req, res) => {
  try {
    console.log('📝 Profile update request received');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);
    
    const { firstName, lastName, email, phone } = req.body;
    
    let profilePictureUrl = req.body.profilePicture;
    
    // If a new image was uploaded, update the profile picture URL
    if (req.file) {
      profilePictureUrl = `/uploads/profiles/${req.file.filename}`;
      console.log('🖼️ New profile picture:', profilePictureUrl);
    }
    
    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: firstName,
        surname: lastName,
        email,
        phone,
        profilePicture: profilePictureUrl
      },
      { new: true }
    );
    
    console.log('✅ User updated successfully:', updatedUser._id);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profilePicture: profilePictureUrl,
      updatedUser
    });
    
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile: ' + error.message
    });
  }
});

module.exports = router;