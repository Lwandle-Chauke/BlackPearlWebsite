const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const { protect, authorize } = require('../middleware/auth');

// Get all quotes (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Get quotes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch quotes'
    });
  }
});

// Get quotes for specific user
router.get('/my-quotes', protect, async (req, res) => {
  try {
    const quotes = await Quote.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: quotes
    });
  } catch (error) {
    console.error('Get user quotes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your quotes'
    });
  }
});

// Create new quote
router.post('/', async (req, res) => {
  try {
    const quoteData = req.body;
    
    // Calculate estimated price based on vehicle type and destination
    const estimatedPrice = calculateEstimatedPrice(
      quoteData.vehicleType,
      quoteData.destination,
      quoteData.isOneWay
    );

    const quote = await Quote.create({
      ...quoteData,
      estimatedPrice,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully',
      data: quote
    });
  } catch (error) {
    console.error('Create quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit quote request: ' + error.message
    });
  }
});

// Update quote status (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, finalPrice, adminNotes } = req.body;
    
    const updateData = { status };
    
    if (finalPrice !== undefined) updateData.finalPrice = finalPrice;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    
    if (status === 'confirmed' && !req.body.confirmedAt) {
      updateData.confirmedAt = new Date();
    }
    if (status === 'booked' && !req.body.bookedAt) {
      updateData.bookedAt = new Date();
    }
    if (status === 'completed' && !req.body.completedAt) {
      updateData.completedAt = new Date();
    }

    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    res.json({
      success: true,
      message: 'Quote updated successfully',
      data: quote
    });
  } catch (error) {
    console.error('Update quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update quote: ' + error.message
    });
  }
});

// Delete quote (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const quote = await Quote.findByIdAndDelete(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    res.json({
      success: true,
      message: 'Quote deleted successfully'
    });
  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete quote: ' + error.message
    });
  }
});

// Create booking from quote (admin only)
router.post('/:id/convert-to-booking', protect, authorize('admin'), async (req, res) => {
  try {
    const { finalPrice, bookingNotes } = req.body;
    
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'booked',
        finalPrice,
        bookingNotes,
        bookedAt: new Date()
      },
      { new: true }
    );

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    res.json({
      success: true,
      message: 'Quote converted to booking successfully',
      data: quote
    });
  } catch (error) {
    console.error('Convert to booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to convert quote to booking: ' + error.message
    });
  }
});

// Create manual booking (admin only)
router.post('/manual-booking', protect, authorize('admin'), async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Calculate estimated price for manual booking
    const estimatedPrice = calculateEstimatedPrice(
      bookingData.vehicleType,
      bookingData.destination || 'Manual Booking',
      bookingData.isOneWay || false
    );

    const quote = await Quote.create({
      ...bookingData,
      estimatedPrice,
      finalPrice: bookingData.finalPrice || estimatedPrice,
      status: 'booked',
      bookedAt: new Date(),
      tripPurpose: bookingData.tripPurpose || 'Manual Booking',
      tripType: bookingData.tripType || 'Manual Booking',
      destination: bookingData.destination || 'Manual Booking',
      isOneWay: bookingData.isOneWay || false
    });

    res.status(201).json({
      success: true,
      message: 'Manual booking created successfully',
      data: quote
    });
  } catch (error) {
    console.error('Create manual booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create manual booking: ' + error.message
    });
  }
});

// Price calculation function based on your rates PDF
function calculateEstimatedPrice(vehicleType, destination, isOneWay) {
  // Base prices based on vehicle type (using rates from your PDF as reference)
  const basePrices = {
    '4 Seater Sedan': 695,
    'Mini Bus Mercedes Viano': 963,
    '15 Seater Quantum': 1200,
    '17 Seater Luxury Sprinter': 1400,
    '22 Seater Luxury Coach': 1800,
    '28 Seater Semi Luxury': 2200,
    '39 Seater Luxury Coach': 2800,
    '60 Seater Semi Luxury': 3500,
    '70 Seater Semi Luxury': 4000
  };

  let basePrice = basePrices[vehicleType] || 1000;

  // Adjust for destination (Johannesburg and Pretoria have different rates)
  if (destination === 'Johannesburg') {
    // Johannesburg rates are generally higher
    basePrice *= 1.1;
  } else if (destination === 'Pretoria') {
    basePrice *= 1.05;
  } else if (destination === 'Cape Town' || destination === 'Durban') {
    // Long distance trips
    basePrice *= 1.3;
  }

  // Round trip adjustment
  if (!isOneWay) {
    basePrice *= 1.8; // Round trip is not exactly double
  }

  // Return calculated price
  return Math.round(basePrice);
}

module.exports = router;