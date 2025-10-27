import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password field
        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Server error fetching users'
        });
    }
});

export default router;
