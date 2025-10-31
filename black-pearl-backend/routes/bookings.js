import express from "express";
import Booking from "../models/Booking.js";
import verifyToken from "../middleware/verifyToken.js"; // For admin routes
import auth from "../middleware/auth.js"; // For user-specific routes (protect)

const router = express.Router();

// Get all bookings (Admin access)
router.get("/", verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ date: -1 });
        res.json({ data: bookings });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch bookings" });
    }
});

// Get bookings for a specific user (User access)
router.get('/user/:userId', auth, async (req, res) => {
    try {
        // Ensure the authenticated user is requesting their own bookings or is an admin
        if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'User not authorized' });
        }
        const bookings = await Booking.find({ user: req.params.userId }).sort({ date: -1 });
        res.json({ data: bookings });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a new booking (Authenticated user access)
router.post("/", auth, async (req, res) => {
    try {
        const { service, name, email, passengers, pickup, dropoff, date, message, status } = req.body;

        const newBooking = new Booking({
            user: req.user.id, // Associate booking with the authenticated user
            service,
            name,
            email,
            passengers,
            pickup,
            dropoff,
            date,
            message,
            status: status || 'pending' // Default to pending if not provided
        });

        await newBooking.save();
        res.status(201).json({ success: true, data: newBooking });
    } catch (err) {
        console.error("Error adding new booking:", err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// Update booking status (Admin access)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ success: false, error: "Booking not found" });
        }

        res.json({ success: true, data: updatedBooking });
    } catch (err) {
        console.error("Error updating booking:", err);
        res.status(400).json({ success: false, error: err.message });
    }
});

// Cancel a booking (User access)
router.post("/:id/cancel", auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ success: false, error: "Booking not found" });
        }

        // Ensure user can only cancel their own bookings
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, error: "Not authorized to cancel this booking" });
        }

        booking.status = 'cancelled';
        await booking.save();

        res.json({ success: true, data: booking });
    } catch (err) {
        console.error("Error cancelling booking:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete a booking (Admin access)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const deletedBooking = await Booking.findByIdAndDelete(req.params.id);

        if (!deletedBooking) {
            return res.status(404).json({ success: false, error: "Booking not found" });
        }

        res.json({ success: true, message: "Booking removed" });
    } catch (err) {
        console.error("Error deleting booking:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
