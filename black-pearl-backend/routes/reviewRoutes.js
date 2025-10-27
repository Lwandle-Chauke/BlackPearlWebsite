import express from 'express';
const router = express.Router();
import { protect, authorize } from '../middleware/auth.js';
import Review from '../models/Review.js';

// Get all reviews (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('user', 'name email')
            .populate('booking')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Submit new review
router.post('/', protect, async (req, res) => {
    try {
        const { rating, comment, photo, booking } = req.body;

        const review = new Review({
            user: req.user.id,
            rating,
            comment,
            photo,
            booking
        });

        await review.save();
        await review.populate('user', 'name email');

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Approve review
router.post('/:id/approve', protect, authorize('admin'), async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        ).populate('user', 'name email');

        res.json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Reject review
router.post('/:id/reject', protect, authorize('admin'), async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        ).populate('user', 'name email');

        res.json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Respond to review
router.post('/:id/respond', protect, authorize('admin'), async (req, res) => {
    try {
        const { response } = req.body;
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { adminResponse: response },
            { new: true }
        ).populate('user', 'name email');

        res.json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
