const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Assuming a Booking model exists
const auth = require('../middleware/auth'); // Assuming an auth middleware exists

// @route   GET api/bookings
// @desc    Get all bookings
// @access  Public (or Private if you want to restrict viewing all bookings)
router.get('/', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bookings/user/:userId
// @desc    Get bookings for a specific user
// @access  Private (requires authentication)
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.params.userId }).sort({ date: -1 });
        res.json({ data: bookings }); // Wrap in data object for consistency with Dashboard.jsx
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/bookings
// @desc    Create a booking
// @access  Private (requires authentication)
router.post('/', auth, async (req, res) => {
    const { name, email, service, date, pickup, dropoff, passengers, message, userId } = req.body;

    try {
        const newBooking = new Booking({
            user: userId, // Associate booking with user
            name,
            email,
            service,
            date,
            pickup,
            dropoff,
            passengers,
            message,
            status: 'pending' // Default status
        });

        const booking = await newBooking.save();
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/bookings/:id
// @desc    Delete a booking
// @access  Private (requires authentication and ownership)
router.delete('/:id', auth, async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) return res.status(404).json({ msg: 'Booking not found' });

        // Ensure user owns the booking
        if (booking.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Booking.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Booking removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
