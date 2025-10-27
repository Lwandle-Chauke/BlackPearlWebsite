const express = require('express');
const router = express.Router();

// Example route for /api/bookings
router.get('/', (req, res) => {
    res.json({ message: 'Bookings API route is working!' });
});

module.exports = router;
