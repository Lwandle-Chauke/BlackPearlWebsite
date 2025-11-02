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

// ===== Middleware =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'https://your-frontend-app.onrender.com' // Add your actual frontend Render URL
    ],
    credentials: true,
  })
);

// ===== MongoDB Connection =====
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');
    
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/blackpearltours',
      {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// Import routes using dynamic imports
let authRoutes, quoteRoutes, galleryRoutes, messageRoutes, feedbackRoutes, imageRoutes;

// Dynamic import for routes
const importRoutes = async () => {
  try {
    authRoutes = (await import('./routes/auth.js')).default;
    quoteRoutes = (await import('./routes/quotes.js')).default;
    galleryRoutes = (await import('./routes/gallery.js')).default;
    messageRoutes = (await import('./routes/messageRoutes.js')).default;
    feedbackRoutes = (await import('./routes/feedbackRoutes.js')).default;
    imageRoutes = (await import('./routes/imageRoutes.js')).default;
    console.log('✅ All routes imported successfully');
  } catch (error) {
    console.error('❌ Route import error:', error);
    throw error;
  }
};

// ===== Import models =====
const importModels = async () => {
  try {
    const GalleryAlbum = (await import('./models/GalleryAlbum.js')).default;
    return { GalleryAlbum };
  } catch (error) {
    console.error('❌ Model import error:', error);
    throw error;
  }
};

// ===== Ensure Default Albums Exist =====
const ensureDefaultAlbums = async (GalleryAlbum) => {
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
    // Connect to database first
    await connectDB();
    
    // Import routes and models
    await importRoutes();
    const models = await importModels();
    
    // Ensure default albums
    await ensureDefaultAlbums(models.GalleryAlbum);

    // ===== Mount Routes =====
    app.use('/api/auth', authRoutes);
    app.use('/api/quotes', quoteRoutes);
    app.use('/api/gallery', galleryRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/images', imageRoutes);

    // ===== Static Folder for Uploads =====
    const uploadsPath = path.join(__dirname, 'uploads');
    app.use('/uploads', express.static(uploadsPath));

    // Serve gallery uploads
    app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads', 'gallery')));

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
          images: '/api/images',
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
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // ===== Serve React Frontend in Production =====
    if (process.env.NODE_ENV === 'production') {
      // Serve static files from the React frontend app
      app.use(express.static(path.join(__dirname, '../black-pearl-frontend/build')));

      // AFTER defining routes, catch all other requests and return the React app
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../black-pearl-frontend/build', 'index.html'));
      });
    } else {
      // Simple test route for development
      app.get('/api/hello', (req, res) => res.json({ msg: 'hi from development' }));
    }

    // ===== Error Handling =====
    app.use((err, req, res, next) => {
      console.error('❌ Server error:', err);
      res.status(err.status || 500).json({
        success: false,
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      });
    });

    // ===== 404 Fallback =====
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: `Route ${req.originalUrl} not found`,
      });
    });

  } catch (error) {
    console.error('❌ Failed to initialize app:', error);
    process.exit(1);
  }
};

// Start the application
initializeApp().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
  });
});

// ===== Process-level diagnostics =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});