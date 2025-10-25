const express = require('express');
const Quote = require('../models/quote');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Submit a new quote
// @route   POST /api/quotes
// @access  Public (both guests and authenticated users)
router.post('/', async (req, res) => {
  try {
    const {
      tripPurpose,
      tripType,
      destination,
      customDestination,
      pickupLocation,
      dropoffLocation,
      vehicleType,
      isOneWay,
      tripDate,
      tripTime,
      customerName,
      customerEmail,
      customerPhone,
      customerCompany,
      userId
    } = req.body;

    // Validation
    const requiredFields = [
      'tripPurpose', 'tripType', 'destination', 'pickupLocation', 
      'dropoffLocation', 'vehicleType', 'tripDate', 'tripTime',
      'customerName', 'customerEmail', 'customerPhone'
    ];

    for (let field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          error: `Please provide ${field}`
        });
      }
    }

    // Create quote
    const quote = await Quote.create({
      tripPurpose,
      tripType,
      destination,
      customDestination: customDestination || '',
      pickupLocation,
      dropoffLocation,
      vehicleType,
      isOneWay: isOneWay || false,
      tripDate: new Date(tripDate),
      tripTime,
      customerName,
      customerEmail,
      customerPhone,
      customerCompany: customerCompany || '',
      userId: userId || null
    });

    console.log('New quote submitted:', quote._id);

    res.status(201).json({
      success: true,
      message: 'Quote submitted successfully! We will contact you shortly.',
      data: quote
    });
  } catch (error) {
    console.error('Quote submission error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during quote submission. Please try again.'
    });
  }
});

// @desc    Get all quotes (for admin)
// @route   GET /api/quotes
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const quotes = await Quote.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone');

    res.json({
      success: true,
      count: quotes.length,
      data: quotes
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching quotes.'
    });
  }
});

// @desc    Update quote status
// @route   PUT /api/quotes/:id
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    res.json({
      success: true,
      message: 'Quote status updated successfully',
      data: quote
    });
  } catch (error) {
    console.error('Update quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while updating quote.'
    });
  }
});

// @desc    Delete quote
// @route   DELETE /api/quotes/:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    await Quote.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while deleting quote.'
    });
  }
});

module.exports = router;