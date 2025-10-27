import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  tripsCompleted: {
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
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only run if password was modified
  if (!this.isModified('password')) return next();

  // Set password reset timestamp
  this.passwordResetAt = new Date();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.correctPassword = async function (candidatePassword) {
  if (!this.password) {
    const userWithPassword = await this.constructor.findById(this._id).select('+password');
    return await bcrypt.compare(candidatePassword, userWithPassword.password);
  }

  return await bcrypt.compare(candidatePassword, this.password);
};

// Alternative method name for compatibility
userSchema.methods.comparePassword = async function (candidatePassword) {
  return this.correctPassword(candidatePassword);
};

const User = mongoose.model('User', userSchema);

export default User;
