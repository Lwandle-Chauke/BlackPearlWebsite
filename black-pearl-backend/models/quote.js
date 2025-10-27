const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  // Trip Details
  tripPurpose: {
    type: String,
    required: true,
    trim: true
  },
  tripType: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  customDestination: {
    type: String,
    trim: true
  },
  pickupLocation: {
    type: String,
    required: true,
    trim: true
  },
  dropoffLocation: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    required: true,
    trim: true
  },
  isOneWay: {
    type: Boolean,
    default: false
  },
  tripDate: {
    type: Date,
    required: true
  },
  tripTime: {
    type: String,
    required: true
  },
  returnDate: {
    type: Date
  },
  
  // Contact Information
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  customerCompany: {
    type: String,
    trim: true
  },
  
  // System Fields
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'booked', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // NEW: Quote status for customer response
  quoteStatus: {
    type: String,
    enum: ['pending_admin', 'pending_customer', 'pending_email', 'accepted', 'declined', 'converted'],
    default: 'pending_admin'
  },
  
  // NEW: Email approval fields
  approvalToken: {
    type: String
  },
  tokenExpires: {
    type: Date
  },
  
  // Pricing Fields
  estimatedPrice: {
    type: Number,
    required: true,
    default: 0
  },
  finalPrice: {
    type: Number
  },
  
  // Loyalty and Discount Fields
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  },
  loyaltyPointsApplied: {
    type: Number,
    default: 0
  },
  discountApplied: {
    type: Number,
    default: 0
  },
  
  // Admin Fields
  adminNotes: {
    type: String,
    trim: true
  },
  bookingNotes: {
    type: String,
    trim: true
  },
  
  // Timestamps
  sentToCustomerAt: {
    type: Date
  },
  confirmedAt: {
    type: Date
  },
  bookedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  customerRespondedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
quoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add text index for search
quoteSchema.index({
  customerName: 'text',
  customerEmail: 'text',
  destination: 'text',
  pickupLocation: 'text',
  dropoffLocation: 'text'
});

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;