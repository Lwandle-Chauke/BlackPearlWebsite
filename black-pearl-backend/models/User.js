const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  surname: {
    type: String,
    required: [true, 'Surname is required'],
    trim: true,
    maxlength: [50, 'Surname cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false
  },
  role: {
    type: String,
    default: 'customer',
    enum: ['customer', 'admin']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Updated loyalty fields
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  tripsCompleted: {
    type: Number,
    default: 0
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  discountEarned: {
    type: Number,
    default: 0
  },
  memberSince: {
    type: String,
    default: new Date().getFullYear().toString()
  },
  profilePicture: {
    type: String,
    default: ''
  },
  passwordResetAt: {
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Auto-calculate tier when loyalty points change
  if (this.isModified('loyaltyPoints')) {
    this.tier = this.calculateTier();
  }
  
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();
  
  // Set password reset timestamp
  this.passwordResetAt = new Date();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method - FIXED
userSchema.methods.correctPassword = async function(candidatePassword) {
  // If password is not selected, fetch user with password
  if (!this.password) {
    const userWithPassword = await this.constructor.findById(this._id).select('+password');
    return await bcrypt.compare(candidatePassword, userWithPassword.password);
  }
  
  return await bcrypt.compare(candidatePassword, this.password);
};

// Alternative method name for compatibility
userSchema.methods.comparePassword = async function(candidatePassword) {
  return this.correctPassword(candidatePassword);
};

// Calculate user tier based on loyalty points
userSchema.methods.calculateTier = function() {
  if (this.loyaltyPoints >= 5000) return 'platinum';
  if (this.loyaltyPoints >= 2000) return 'gold';
  if (this.loyaltyPoints >= 500) return 'silver';
  return 'bronze';
};

// Method to add loyalty points
userSchema.methods.addLoyaltyPoints = function(points, amountSpent = 0) {
  this.loyaltyPoints += points;
  if (amountSpent > 0) {
    this.totalSpent += amountSpent;
  }
  this.totalTrips += 1;
  this.tripsCompleted += 1;
  this.tier = this.calculateTier();
  return this.save();
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.name} ${this.surname}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// FIX: Check if model already exists before creating
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;