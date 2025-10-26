// routes/loyalty.js
const express = require('express');
const router = express.Router();
const Quote = require('../models/quote');
const User = require('../models/user');
const { protect } = require('../middleware/auth');
const LoyaltyService = require('../services/loyaltyService');

// Get user's loyalty info
router.get('/my-loyalty', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const quotes = await Quote.find({ 
      userId: req.user.id,
      status: 'completed'
    }).sort({ completedAt: -1 });

    const tierInfo = LoyaltyService.getTierBenefits(user.tier);
    
    res.json({
      success: true,
      data: {
        user: {
          loyaltyPoints: user.loyaltyPoints,
          totalTrips: user.totalTrips,
          totalSpent: user.totalSpent,
          tier: user.tier,
          tierName: tierInfo.name,
          discountRate: tierInfo.discountRate,
          memberSince: user.memberSince
        },
        recentTrips: quotes.slice(0, 5),
        availableDiscount: LoyaltyService.calculateDiscount(user.loyaltyPoints)
      }
    });
  } catch (error) {
    console.error('Get loyalty info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch loyalty information'
    });
  }
});

// Apply loyalty points discount to a quote
router.post('/apply-discount', protect, async (req, res) => {
  try {
    const { quoteId, pointsToUse } = req.body;
    
    const user = await User.findById(req.user.id);
    const quote = await Quote.findById(quoteId);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    if (quote.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this quote'
      });
    }

    if (user.loyaltyPoints < pointsToUse) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient loyalty points'
      });
    }

    const discountAmount = LoyaltyService.calculateDiscount(pointsToUse);
    const tierDiscount = LoyaltyService.getTierBenefits(user.tier).discountRate;
    const tierDiscountAmount = (quote.finalPrice * tierDiscount) / 100;
    const totalDiscount = discountAmount + tierDiscountAmount;

    // Update quote with discount
    quote.discountApplied = totalDiscount;
    quote.loyaltyPointsApplied = pointsToUse;
    await quote.save();

    res.json({
      success: true,
      message: 'Discount applied successfully',
      data: {
        discountAmount: totalDiscount,
        pointsUsed: pointsToUse,
        remainingPoints: user.loyaltyPoints - pointsToUse
      }
    });
  } catch (error) {
    console.error('Apply discount error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to apply discount: ' + error.message
    });
  }
});

module.exports = router;