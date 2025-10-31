
import express from 'express';
const router = express.Router();
import Quote from '../models/quote.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import LoyaltyService from '../services/loyaltyService.js';
import crypto from 'crypto';
import sendQuoteEmail from '../services/emailService.js'; // Fixed import

// Formspree configuration (fallback)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xpwojyqq';

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

    // Calculate estimated price based on vehicle type, pickup, dropoff, and destination
    const estimatedPrice = calculateEstimatedPrice(
      quoteData.vehicleType,
      quoteData.pickupLocation,
      quoteData.dropoffLocation,
      quoteData.destination,
      quoteData.isOneWay
    );

    const quote = await Quote.create({
      ...quoteData,
      estimatedPrice,
      status: 'pending',
      quoteStatus: 'pending_admin'
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

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    const oldStatus = quote.status;
    const updateData = { status };

    if (finalPrice !== undefined) updateData.finalPrice = finalPrice;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    // Handle loyalty points when trip is completed
    if (status === 'completed' && oldStatus !== 'completed') {
      updateData.completedAt = new Date();

      // Calculate and award loyalty points
      if (quote.userId && finalPrice) {
        const pointsEarned = LoyaltyService.calculatePointsEarned(
          finalPrice,
          quote.vehicleType
        );

        updateData.loyaltyPointsEarned = pointsEarned;

        // Update user's loyalty points and stats
        const user = await User.findById(quote.userId);
        if (user) {
          user.loyaltyPoints += pointsEarned;
          user.totalTrips += 1;
          user.totalSpent += finalPrice;
          user.tier = user.calculateTier();

          await user.save();
        }
      }
    }

    // Handle booking confirmation
    if (status === 'confirmed' && !req.body.confirmedAt) {
      updateData.confirmedAt = new Date();
    }

    // Handle booking
    if (status === 'booked' && !req.body.bookedAt) {
      updateData.bookedAt = new Date();
    }

    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Quote updated successfully',
      data: updatedQuote
    });
  } catch (error) {
    console.error('Update quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update quote: ' + error.message
    });
  }
});

// Allow a user to edit their own quote/booking when it's still pending
router.put('/:id/edit', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ success: false, error: 'Quote not found' });
    }

    // Only the owner can edit and only when status is 'pending'
    if (quote.userId?.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Not authorized to edit this quote' });
    }

    if (quote.status !== 'pending') {
      return res.status(403).json({ success: false, error: 'Cannot edit a quote that is already confirmed or processed' });
    }

    // Only allow updating safe fields
    const allowed = [
      'tripPurpose',
      'tripType',
      'destination',
      'pickupLocation',
      'dropoffLocation',
      'vehicleType',
      'isOneWay',
      'tripDate',
      'tripTime',
      'passengerCount',
      'specialRequests',
      'customerName',
      'customerEmail',
      'customerPhone'
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) quote[field] = req.body[field];
    });

    await quote.save();

    res.json({ success: true, message: 'Quote updated successfully', data: quote });
  } catch (error) {
    console.error('User edit quote error:', error);
    res.status(500).json({ success: false, error: 'Failed to edit quote: ' + error.message });
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

// Send quote to customer (admin)
router.post('/:id/send-to-customer', protect, authorize('admin'), async (req, res) => {
  try {
    const { finalPrice, adminNotes } = req.body;

    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Generate unique token for email approval
    const approvalToken = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        status: 'confirmed',
        quoteStatus: quote.userId ? 'pending_customer' : 'pending_email',
        finalPrice,
        adminNotes,
        sentToCustomerAt: new Date(),
        approvalToken,
        tokenExpires
      },
      { new: true }
    );

    // Send email using the new professional email service
    try {
      const emailData = {
        name: quote.customerName,
        tripType: quote.tripType,
        vehicle: quote.vehicleType,
        route: `${quote.pickupLocation} → ${quote.dropoffLocation}`,
        date: quote.tripDate,
        time: quote.tripTime,
        price: finalPrice,
        acceptLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quote-accept/${quote._id}?token=${approvalToken}`,
        declineLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quote-decline/${quote._id}?token=${approvalToken}`,
        loginLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
        websiteLink: process.env.FRONTEND_URL || 'http://localhost:3000'
      };

      await sendQuoteEmail(quote.customerEmail, emailData);
      console.log('✅ Professional quote email sent successfully via Nodemailer');
      
    } catch (emailError) {
      console.error('❌ Failed to send professional email, falling back to Formspree:', emailError);
      
      // Fallback to Formspree
      try {
        await sendQuoteEmailFormspree(quote, finalPrice, adminNotes, approvalToken);
      } catch (fallbackError) {
        console.error('❌ Formspree fallback also failed:', fallbackError);
      }
    }

    res.json({
      success: true,
      message: quote.userId
        ? 'Quote sent to customer dashboard successfully'
        : 'Quote sent to customer email successfully',
      data: updatedQuote
    });
  } catch (error) {
    console.error('Send to customer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send quote to customer: ' + error.message
    });
  }
});

// Check quote status and registration requirement
router.get('/:id/check-quote', async (req, res) => {
  try {
    const { token } = req.query;
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Validate token
    if (quote.approvalToken !== token || new Date() > quote.tokenExpires) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired approval token'
      });
    }

    // Check if quote already has a user
    if (quote.userId) {
      return res.json({
        success: true,
        requiresRegistration: false,
        data: quote
      });
    }

    // Quote requires user registration
    res.json({
      success: true,
      requiresRegistration: true,
      data: {
        quoteId: quote._id,
        token: token,
        quoteDetails: {
          customerName: quote.customerName,
          customerEmail: quote.customerEmail,
          tripType: quote.tripType,
          pickupLocation: quote.pickupLocation,
          dropoffLocation: quote.dropoffLocation,
          tripDate: quote.tripDate,
          finalPrice: quote.finalPrice,
          vehicleType: quote.vehicleType
        }
      }
    });
  } catch (error) {
    console.error('Check quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check quote: ' + error.message
    });
  }
});

// Public route for email quote acceptance (for registered users)
router.post('/:id/accept-quote', async (req, res) => {
  try {
    const { token } = req.body;
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Validate token
    if (quote.approvalToken !== token || new Date() > quote.tokenExpires) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired approval token'
      });
    }

    // Check if user is registered (quote has userId)
    if (!quote.userId) {
      return res.status(403).json({
        success: false,
        error: 'REGISTRATION_REQUIRED',
        message: 'Please create an account to accept this quote',
        data: {
          quoteId: quote._id,
          token: token
        }
      });
    }

    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        quoteStatus: 'accepted',
        status: 'booked',
        bookedAt: new Date(),
        approvalToken: null, // Clear token after use
        tokenExpires: null
      },
      { new: true }
    );

    // Send confirmation email
    try {
      await sendConfirmationEmail(quote, 'accepted');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Quote accepted successfully! Your booking has been confirmed.',
      data: updatedQuote
    });
  } catch (error) {
    console.error('Email accept error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept quote: ' + error.message
    });
  }
});

// Accept quote with registration (for unregistered users)
router.post('/:id/accept-with-registration', async (req, res) => {
  try {
    const { token, email, password, firstName, lastName, phone } = req.body;
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Validate token
    if (quote.approvalToken !== token || new Date() > quote.tokenExpires) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired approval token'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists. Please log in.'
      });
    }

    // Create new user
    const newUser = await User.create({
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      role: 'customer'
    });

    // Update quote with user association and accept it
    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        userId: newUser._id,
        quoteStatus: 'accepted',
        status: 'booked',
        bookedAt: new Date(),
        approvalToken: null,
        tokenExpires: null
      },
      { new: true }
    );

    // Send confirmation email
    try {
      await sendConfirmationEmail(updatedQuote, 'accepted');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Account created and booking confirmed successfully!',
      data: {
        quote: updatedQuote,
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      }
    });
  } catch (error) {
    console.error('Accept with registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account and accept quote: ' + error.message
    });
  }
});

// Public route for email quote decline
router.post('/:id/decline-quote', async (req, res) => {
  try {
    const { token, declineReason } = req.body;
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Validate token
    if (quote.approvalToken !== token || new Date() > quote.tokenExpires) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired approval token'
      });
    }

    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        quoteStatus: 'declined',
        status: 'cancelled',
        adminNotes: declineReason ? `Customer declined: ${declineReason}` : 'Customer declined quote',
        approvalToken: null, // Clear token after use
        tokenExpires: null
      },
      { new: true }
    );

    // Send confirmation email
    try {
      await sendConfirmationEmail(quote, 'declined');
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Quote declined successfully.',
      data: updatedQuote
    });
  } catch (error) {
    console.error('Email decline error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decline quote: ' + error.message
    });
  }
});

// Customer accepts quote (for registered users via dashboard)
router.post('/:id/customer-accept', protect, async (req, res) => {
  try {
    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        quoteStatus: 'accepted',
        status: 'booked',
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
      message: 'Quote accepted successfully',
      data: quote
    });
  } catch (error) {
    console.error('Customer accept error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept quote: ' + error.message
    });
  }
});

// Customer declines quote (for registered users via dashboard)
router.post('/:id/customer-decline', protect, async (req, res) => {
  try {
    const { declineReason } = req.body;

    const quote = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        quoteStatus: 'declined',
        status: 'cancelled',
        adminNotes: declineReason ? `Customer declined: ${declineReason}` : 'Customer declined quote'
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
      message: 'Quote declined successfully',
      data: quote
    });
  } catch (error) {
    console.error('Customer decline error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decline quote: ' + error.message
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
        quoteStatus: 'converted',
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
      bookingData.pickupLocation || 'Manual Booking', // Added pickupLocation
      bookingData.dropoffLocation || 'Manual Booking', // Added dropoffLocation
      bookingData.destination || 'Manual Booking',
      bookingData.isOneWay || false
    );

    const quote = await Quote.create({
      ...bookingData,
      estimatedPrice,
      finalPrice: bookingData.finalPrice || estimatedPrice,
      status: 'booked',
      quoteStatus: 'converted',
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

// New endpoint to get estimated price
router.post('/estimate-price', async (req, res) => {
  try {
    const { vehicleType, pickupLocation, dropoffLocation, destination, isOneWay } = req.body;

    if (!vehicleType || !pickupLocation || !dropoffLocation || !destination) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields for price estimation.'
      });
    }

    const estimatedPrice = calculateEstimatedPrice(
      vehicleType,
      pickupLocation,
      dropoffLocation,
      destination,
      isOneWay
    );

    res.json({
      success: true,
      estimatedPrice
    });
  } catch (error) {
    console.error('Estimate price error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to estimate price: ' + error.message
    });
  }
});

// Formspree Email sending functions (fallback)
async function sendQuoteEmailFormspree(quote, finalPrice, adminNotes, approvalToken) {
  const acceptLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quote-accept/${quote._id}?token=${approvalToken}`;
  const declineLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quote-decline/${quote._id}?token=${approvalToken}`;

  const emailData = {
    _subject: `Your Quote from Black Pearl Tours - R ${finalPrice}`,
    name: quote.customerName,
    email: quote.customerEmail,
    message: `
Black Pearl Tours
Your Quote - R ${finalPrice}

Dear ${quote.customerName},

Thank you for requesting a quote with Black Pearl Tours. We're pleased to provide you with the following quote for your upcoming trip:

Quote Details
Trip Type: ${quote.tripType}

Vehicle: ${quote.vehicleType}

Route: ${quote.pickupLocation} → ${quote.dropoffLocation}

Date: ${new Date(quote.tripDate).toLocaleDateString()}

Time: ${quote.tripTime}

Final Price: R ${finalPrice}
${adminNotes ? `\nAdmin Notes: ${adminNotes}\n` : ''}

Important: You'll need to create an account to accept this quote. This allows you to:

Manage your booking online
Receive loyalty points
Track your trip history
Get special offers and discounts

Accept & Register: ${acceptLink}
Decline Quote: ${declineLink}

Already have an account? Log in here first, then visit your dashboard to accept the quote: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login

If the buttons don't work, you can use these links:
Accept: ${acceptLink}
Decline: ${declineLink}

Thank you for considering Black Pearl Tours!
    `.trim()
  };

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log('✅ Quote email sent successfully via Formspree (fallback)');
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Formspree email error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send quote email via Formspree:', error);
    return false;
  }
}

async function sendConfirmationEmail(quote, action) {
  const subject = action === 'accepted'
    ? 'Booking Confirmed - Black Pearl Tours'
    : 'Quote Declined - Black Pearl Tours';

  const message = action === 'accepted'
    ? `
Dear ${quote.customerName},

Your booking has been confirmed! We look forward to serving you.

Booking Details:
Trip: ${quote.tripType}
Route: ${quote.pickupLocation} → ${quote.dropoffLocation}
Date: ${new Date(quote.tripDate).toLocaleDateString()}
Time: ${quote.tripTime}
Vehicle: ${quote.vehicleType}
Price: R ${quote.finalPrice}

You can manage your booking by logging into your account at: ${process.env.FRONTEND_URL || 'http://localhost:3000'}

Thank you for choosing Black Pearl Tours!
    `.trim()
    : `
Dear ${quote.customerName},

Your quote request has been declined. We hope to serve you in the future!

If this was a mistake or you'd like to discuss alternative options, please contact us.

Thank you for considering Black Pearl Tours!
    `.trim();

  const emailData = {
    _subject: subject,
    name: quote.customerName,
    email: quote.customerEmail,
    message: message
  };

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log(`✅ Confirmation email sent (${action}) via Formspree`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Formspree confirmation email error (${action}):`, errorText);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to send ${action} confirmation email via Formspree:`, error);
    return false;
  }
}

// Rate structures based on the PDF
const johannesburgRates = {
  '4 Seater Sedan': { zone1: 695, zone2: 845, zone3: 856, zone4: 963, zone5: 1059, zone6: 1900 },
  'Mini Bus Mercedes Viano': { zone1: 963, zone2: 1123, zone3: 1357, zone4: 1357, zone5: 1487, zone6: 2354 },
  '15 Seater Quantum': { zone1: 1200, zone2: 1400, zone3: 1600, zone4: 1800, zone5: 2000, zone6: 2800 },
  '17 Seater Luxury Sprinter': { zone1: 1400, zone2: 1600, zone3: 1800, zone4: 2000, zone5: 2200, zone6: 3200 },
  '22 Seater Luxury Coach': { zone1: 1800, zone2: 2000, zone3: 2200, zone4: 2400, zone5: 2600, zone6: 3800 },
  '28 Seater Luxury Coach': { zone1: 2200, zone2: 2400, zone3: 2600, zone4: 2800, zone5: 3000, zone6: 4200 },
  '39 Seater Luxury Coach': { zone1: 2800, zone2: 3000, zone3: 3200, zone4: 3400, zone5: 3600, zone6: 5000 },
  '60 Seater Semi Luxury': { zone1: 3500, zone2: 3700, zone3: 3900, zone4: 4100, zone5: 4300, zone6: 5800 },
  '70 Seater Semi Luxury': { zone1: 4000, zone2: 4200, zone3: 4400, zone4: 4600, zone5: 4800, zone6: 6500 }
};

const pretoriaRates = {
  '4 Seater Sedan': { zone4: 856, zone5: 963, zone6: 1800 },
  'Mini Bus Mercedes Viano': { zone4: 1800, zone5: 1700, zone6: 2300 },
  '15 Seater Quantum': { zone4: 2000, zone5: 2100, zone6: 2800 },
  '17 Seater Luxury Sprinter': { zone4: 2200, zone5: 2300, zone6: 3200 },
  '22 Seater Luxury Coach': { zone4: 2600, zone5: 2700, zone6: 3800 },
  '28 Seater Luxury Coach': { zone4: 3000, zone5: 3100, zone6: 4200 },
  '39 Seater Luxury Coach': { zone4: 3600, zone5: 3700, zone6: 5000 },
  '60 Seater Semi Luxury': { zone4: 4300, zone5: 4400, zone6: 5800 },
  '70 Seater Semi Luxury': { zone4: 4800, zone5: 4900, zone6: 6500 }
};

function getHigherZone(zone1, zone2) {
  const zones = ['zone1', 'zone2', 'zone3', 'zone4', 'zone5', 'zone6'];
  const index1 = zones.indexOf(zone1);
  const index2 = zones.indexOf(zone2);
  return zones[Math.max(index1, index2)];
}

function calculateDefaultPrice(vehicle, dest) {
  // Default pricing for vehicles when outside Johannesburg/Pretoria
  const defaultPrices = {
    '4 Seater Sedan': 1000,
    'Mini Bus Mercedes Viano': 1500,
    '15 Seater Quantum': 1800,
    '17 Seater Luxury Sprinter': 2200,
    '22 Seater Luxury Coach': 2800,
    '28 Seater Luxury Coach': 3200,
    '39 Seater Luxury Coach': 3800,
    '60 Seater Semi Luxury': 4500,
    '70 Seater Semi Luxury': 5000
  };

  let price = defaultPrices[vehicle] || 2000;

  // Adjust for long distance
  if (dest === 'Cape Town' || dest === 'Durban') {
    price *= 2.5;
  } else if (dest === 'Port Elizabeth' || dest === 'Bloemfontein') {
    price *= 2.0;
  }

  return Math.round(price);
}

// Price calculation function based on your rates PDF
function calculateEstimatedPrice(vehicleType, pickupLocation, dropoffLocation, destination, isOneWay) {
  if (!vehicleType || !pickupLocation || !dropoffLocation) {
    return 0;
  }

  let basePrice = 0;
  const isJohannesburg = pickupLocation.toLowerCase().includes('johannesburg') ||
    dropoffLocation.toLowerCase().includes('johannesburg');
  const isPretoria = pickupLocation.toLowerCase().includes('pretoria') ||
    dropoffLocation.toLowerCase().includes('pretoria');

  // Determine zone based on locations (simplified logic - you might want to enhance this)
  const determineZone = (location) => {
    if (location.toLowerCase().includes('zone1') || location.toLowerCase().includes('bedford')) return 'zone1';
    if (location.toLowerCase().includes('zone2') || location.toLowerCase().includes('parktown')) return 'zone2';
    if (location.toLowerCase().includes('zone3') || location.toLowerCase().includes('douglasdale')) return 'zone3';
    if (location.toLowerCase().includes('zone4') || location.toLowerCase().includes('florida')) return 'zone4';
    if (location.toLowerCase().includes('zone5') || location.toLowerCase().includes('kempton')) return 'zone5';
    if (location.toLowerCase().includes('zone6') || location.toLowerCase().includes('brits')) return 'zone6';
    return 'zone1'; // default to zone1
  };

  const pickupZone = determineZone(pickupLocation);
  const dropoffZone = determineZone(dropoffLocation);

  // Use the higher zone for pricing
  const zone = getHigherZone(pickupZone, dropoffZone);

  if (isJohannesburg && johannesburgRates[vehicleType] && johannesburgRates[vehicleType][zone]) {
    basePrice = johannesburgRates[vehicleType][zone];
  } else if (isPretoria && pretoriaRates[vehicleType] && pretoriaRates[vehicleType][zone]) {
    basePrice = pretoriaRates[vehicleType][zone];
  } else {
    // For other destinations or unknown zones, use a default calculation
    basePrice = calculateDefaultPrice(vehicleType, destination);
  }

  // Apply both ways multiplier (1.8x for round trip as per your backend)
  const finalPrice = !isOneWay ? Math.round(basePrice * 1.8) : basePrice;

  return finalPrice;
}

// Fix loyalty points
router.post('/fix-loyalty-points', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const quotes = await Quote.find({
      userId: req.user.id,
      status: 'completed'
    });

    let totalPoints = 0;
    let totalSpent = 0;
    let fixedQuotes = [];

    // Recalculate points for all completed quotes
    for (const quote of quotes) {
      if (quote.finalPrice && !quote.loyaltyPointsEarned) {
        const pointsEarned = LoyaltyService.calculatePointsEarned(
          quote.finalPrice,
          quote.vehicleType
        );

        // Update the quote with earned points
        quote.loyaltyPointsEarned = pointsEarned;
        await quote.save();

        totalPoints += pointsEarned;
        totalSpent += quote.finalPrice;
        fixedQuotes.push({
          id: quote._id,
          points: pointsEarned,
          price: quote.finalPrice
        });
      } else if (quote.loyaltyPointsEarned) {
        totalPoints += quote.loyaltyPointsEarned;
        totalSpent += quote.finalPrice || 0;
      }
    }

    // Update user with correct points
    user.loyaltyPoints = totalPoints;
    user.totalSpent = totalSpent;
    user.totalTrips = quotes.length;
    user.tier = user.calculateTier();
    await user.save();

    res.json({
      success: true,
      message: 'Loyalty points recalculated successfully',
      data: {
        pointsAdded: totalPoints,
        totalSpent: totalSpent,
        tripsCount: quotes.length,
        newTier: user.tier,
        fixedQuotes: fixedQuotes
      }
    });
  } catch (error) {
    console.error('Fix loyalty points error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix loyalty points: ' + error.message
    });
  }
});


// Cancel a quote (user or admin)
router.post('/:id/cancel', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Quote not found'
      });
    }

    // Check if the user is the owner of the quote or an admin
    if (quote.userId && quote.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to cancel this quote'
      });
    }

    // Update both status and quoteStatus
    const updateData = {
      status: 'cancelled',
      quoteStatus: 'cancelled',
      cancelledAt: new Date(),
      cancelledBy: req.user.id
    };

    const updatedQuote = await Quote.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Quote cancelled successfully',
      data: updatedQuote
    });
  } catch (error) {
    console.error('Cancel quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel quote: ' + error.message
    });
  }
});

export default router;
