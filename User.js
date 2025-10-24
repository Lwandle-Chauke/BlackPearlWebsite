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
    select: false // Don't return password in queries by default
  },
  role: {
    type: String,
    default: 'customer',
    enum: ['customer', 'admin']
  },
  // PROFILE FIELDS ADDED BELOW - EMPTY DEFAULTS AS REQUESTED
  company: {
    type: String,
    default: '', // EMPTY
    trim: true
  },
  address: {
    type: String,
    default: '', // EMPTY
    trim: true
  },
  city: {
    type: String,
    default: '', // EMPTY
    trim: true
  },
  postalCode: {
    type: String,
    default: '', // EMPTY
    trim: true
  },
  country: {
    type: String,
    default: '', // EMPTY
    trim: true
  },
  dob: {
    type: Date,
    default: null // EMPTY
  },
  profilePicture: {
    type: String,
    default: ''
  },
  loyaltyPoints: {
    type: Number,
    default: 0 // Start with 0
  },
  tripsCompleted: {
    type: Number,
    default: 0 // Start with 0
  },
  memberSince: {
    type: String,
    default: '2025' // Current year
  },
  // END OF PROFILE FIELDS
  isActive: {
    type: Boolean,
    default: true
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
  next();
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();
  
  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method - FIXED VERSION
userSchema.methods.correctPassword = async function(candidatePassword) {
  // Since password is not selected by default, we need to ensure we have it
  if (!this.password) {
    // If password isn't available, we need to query the user with password
    const userWithPassword = await this.constructor.findById(this._id).select('+password');
    return await bcrypt.compare(candidatePassword, userWithPassword.password);
  }
  
  return await bcrypt.compare(candidatePassword, this.password);
};

// Alternative method name for compatibility
userSchema.methods.comparePassword = async function(candidatePassword) {
  return this.correctPassword(candidatePassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;