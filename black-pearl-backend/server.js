// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// For ES6 modules, we need to create __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Serve gallery uploads
app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads', 'gallery')));

// ===== Middleware =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Import routes using dynamic imports
let authRoutes, quoteRoutes, galleryRoutes, messageRoutes, feedbackRoutes;

// Dynamic import for routes - UPDATED FILE NAMES
const importRoutes = async () => {
  authRoutes = (await import('./routes/auth.js')).default;
  quoteRoutes = (await import('./routes/quotes.js')).default;
  galleryRoutes = (await import('./routes/gallery.js')).default;
  messageRoutes = (await import('./routes/messageRoutes.js')).default; // CHANGED
  feedbackRoutes = (await import('./routes/feedbackRoutes.js')).default; // CHANGED
};

// ===== MongoDB Connection =====
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/blackpearltours'
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// ===== Import models =====
import GalleryAlbum from './models/GalleryAlbum.js';

// ===== Ensure Default Albums Exist =====
const ensureDefaultAlbums = async () => {
  try {
    const defaults = [
      'Events and Leisure',
      'Sports Tour',
      'Tourism and Sightseeing',
      'Other',
    ];

    for (const name of defaults) {
      const exists = await GalleryAlbum.findOne({ albumName: name }).lean();
      if (!exists) {
        await GalleryAlbum.create({ albumName: name, images: [] });
        console.log(`✅ Created default album: ${name}`);
      }
    }
  } catch (err) {
    console.error('Error ensuring default albums:', err.message || err);
  }
};

// ===== Initialize App =====
const initializeApp = async () => {
  try {
    // Import routes first
    await importRoutes();
    
    // Connect to database
    await connectDB();
    
    // Ensure default albums
    await ensureDefaultAlbums();

    // ===== Mount Routes =====
    app.use('/api/auth', authRoutes);
    app.use('/api/quotes', quoteRoutes);
    app.use('/api/gallery', galleryRoutes);
    app.use('/api/messages', messageRoutes); // MOUNT MESSAGE ROUTES
    app.use('/api/feedback', feedbackRoutes); // MOUNT FEEDBACK ROUTES

    // ===== Static Folder for Uploads =====
    const uploadsPath = path.join(__dirname, 'uploads');
    app.use('/uploads', express.static(uploadsPath));

    // ===== Basic API Info =====
    app.get('/api', (req, res) => {
      res.json({
        success: true,
        message: 'Black Pearl Tours API is running!',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          quotes: '/api/quotes',
          gallery: '/api/gallery',
          messages: '/api/messages',
          feedback: '/api/feedback',
          uploads: '/uploads',
        },
      });
    });

    // ===== Health Check =====
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString(),
      });
    });

    // ===== Error Handling =====
    app.use((err, req, res, next) => {
      console.error('❌ Server error:', err);
      res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
      });
    });

    // ===== 404 Fallback =====
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
      });
    });

    // ===== Start Server =====
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
      console.log(`📨 Messages API: http://localhost:${PORT}/api/messages`);
      console.log(`💬 Feedback API: http://localhost:${PORT}/api/feedback`);
    });

  } catch (error) {
    console.error('Failed to initialize app:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp();

// ===== Process-level diagnostics =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});