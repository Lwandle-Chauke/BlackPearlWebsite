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
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
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

const Quote = mongoose.model('Quote', quoteSchema);

module.exports = Quote;