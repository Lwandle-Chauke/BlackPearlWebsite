// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackpearltours');
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

connectDB();

// Import middleware
const { protect, authorize } = require('./middleware/authMiddleware');

// Routes
const authRoutes = require('./routes/auth');
const quoteRoutes = require('./routes/quotes');

app.use('/api/auth', authRoutes);
app.use('/api/quotes', quoteRoutes);

// Basic routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Black Pearl Tours API is running!',
    timestamp: new Date().toISOString()
  console.log(`🔑 Auth endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`📋 Quote endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/quotes (Public - Submit quote)`);
  console.log(`   GET  http://localhost:${PORT}/api/quotes (Admin - Get all quotes)`);
  console.log(`   PUT  http://localhost:${PORT}/api/quotes/:id (Admin - Update quote)`);
  console.log(`   DELETE http://localhost:${PORT}/api/quotes/:id (Admin - Delete quote)`);
  console.log(`🔒 Admin endpoints (protected):`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/test`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/dashboard`);
});
});

// Import routes
const bookingRoutes = require('./routes/bookings');

// Use routes
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// Protected admin test route
app.get('/api/admin/test', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin access granted!',
    user: req.user
  });
});

// Protected admin dashboard data route
app.get('/api/admin/dashboard', protect, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin dashboard data',
    stats: {
      totalUsers: 150,
      totalBookings: 45,
      newMessages: 12,
      revenue: 12500
    },
    user: req.user
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Simple 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api`);
  console.log(`🔑 Auth endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
  console.log(`📋 Quote endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/quotes (Public - Submit quote)`);
  console.log(`   GET  http://localhost:${PORT}/api/quotes (Admin - Get all quotes)`);
  console.log(`   PUT  http://localhost:${PORT}/api/quotes/:id (Admin - Update quote)`);
  console.log(`   DELETE http://localhost:${PORT}/api/quotes/:id (Admin - Delete quote)`);
  console.log(`🔒 Admin endpoints (protected):`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/test`);
  console.log(`   GET  http://localhost:${PORT}/api/admin/dashboard`);
});
