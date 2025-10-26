const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Clear module cache in dev (prevents model overwrite)
if (process.env.NODE_ENV === 'development') {
  ['user', 'quote'].forEach(model => {
    const modelPath = `./models/${model}`;
    if (require.cache[require.resolve(modelPath)]) delete require.cache[require.resolve(modelPath)];
  });
}

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
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blackpearltours', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};
connectDB();

// Import middleware & routes
const { protect, authorize } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const quoteRoutes = require('./routes/quotes');

app.use('/api/auth', authRoutes);
app.use('/api/quotes', quoteRoutes);

// Basic API route
app.get('/api', (req, res) => res.json({ success: true, message: 'Black Pearl Tours API running!', timestamp: new Date() }));
app.get('/api/health', (req, res) => res.json({
  status: 'OK',
  database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
  timestamp: new Date()
}));

// Protected admin routes
app.get('/api/admin/test', protect, authorize('admin'), (req, res) => res.json({ success: true, message: 'Admin access granted!', user: req.user }));
app.get('/api/admin/dashboard', protect, authorize('admin'), (req, res) => res.json({
  success: true,
  message: 'Admin dashboard data',
  stats: { totalUsers: 150, totalBookings: 45, newMessages: 12, revenue: 12500 },
  user: req.user
}));

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` }));

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🔻 Shutting down server...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
});