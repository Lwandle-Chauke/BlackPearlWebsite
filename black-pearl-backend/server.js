import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import messageRoutes from "./routes/messageRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from './routes/auth.js';
import quoteRoutes from './routes/quotes.js';
import { protect, authorize } from './middleware/auth.js';

dotenv.config({ path: './black-pearl-backend/.env' });
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

// Routes
app.use("/api/messages", messageRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes); // Use user routes
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
});
