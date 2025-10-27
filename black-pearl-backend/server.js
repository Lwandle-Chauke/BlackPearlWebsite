const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackpearltours');
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};
connectDB();

// Import routes
const authRoutes = require('./routes/auth');
const quoteRoutes = require('./routes/quotes');

// Use basic routes first (comment out new routes temporarily)
app.use('/api/auth', authRoutes);
app.use('/api/quotes', quoteRoutes);

// Test route for reviews (simple version)
app.get('/api/reviews', (req, res) => {
  res.json({ success: true, data: [] });
});

app.post('/api/reviews', (req, res) => {
  console.log('📝 Review submitted:', req.body);
  res.json({ 
    success: true, 
    data: { 
      ...req.body, 
      _id: 'test-' + Date.now(), 
      status: 'pending', 
      createdAt: new Date() 
    } 
  });
});

// Test route for uploads (simple version)
app.post('/api/uploads/review-photo', (req, res) => {
  console.log('📸 Photo upload attempt');
  res.json({
    success: true,
    photoUrl: '/uploads/reviews/test-photo.jpg'
  });
});

// Basic API route
app.get('/api', (req, res) => res.json({ success: true, message: 'Black Pearl Tours API running!', timestamp: new Date() }));
app.get('/api/health', (req, res) => res.json({
  status: 'OK',
  database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  timestamp: new Date()
}));

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
});