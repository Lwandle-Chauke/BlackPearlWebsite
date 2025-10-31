
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST, before any other imports
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Now import routes after environment variables are loaded
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from './routes/auth.js';
import quoteRoutes from './routes/quotes.js';

import imageRoutes from './routes/imageRoutes.js'; // Import image routes

import { protect, authorize } from './middleware/auth.js';


const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✓ Loaded' : '✗ Missing');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✓ Loaded' : '✗ Missing');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Loaded' : '✗ Missing');
    
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
app.use("/api/users", userRoutes); // Use user routes
app.use('/api/auth', authRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/images', imageRoutes); // Use image routes

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
  email: process.env.EMAIL_USER ? 'Configured' : 'Not Configured',
  timestamp: new Date()
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
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`📧 Email Service: ${process.env.EMAIL_USER ? '✅ Nodemailer Configured' : '❌ Email Not Configured'}`);
});
