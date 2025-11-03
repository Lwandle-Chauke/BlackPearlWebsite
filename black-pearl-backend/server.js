import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// ===== Debugging Middleware =====
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log(`   Headers:`, req.headers['content-type']);
  next();
});

// ===== Middleware =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:3000',
      'https://your-frontend-app.onrender.com'
    ],
    credentials: true,
  })
);

// ===== MongoDB Connection =====
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/blackpearltours',
      { serverSelectionTimeoutMS: 5000, socketTimeoutMS: 45000 }
    );
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

// ===== Dynamic Route Imports =====
let authRoutes, quoteRoutes, galleryRoutes, messageRoutes, feedbackRoutes, imageRoutes;
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

// ===== Model Import =====
const importModels = async () => {
  try {
    const GalleryAlbum = (await import('./models/GalleryAlbum.js')).default;
    return { GalleryAlbum };
  } catch (error) {
    console.error('❌ Model import error:', error);
    throw error;
  }
};

// ===== Ensure Default Albums =====
const ensureDefaultAlbums = async (GalleryAlbum) => {
  const defaults = ['Events and Leisure', 'Sports Tour', 'Tourism and Sightseeing', 'Other'];
  for (const name of defaults) {
    const exists = await GalleryAlbum.findOne({ albumName: name }).lean();
    if (!exists) {
      await GalleryAlbum.create({ albumName: name, images: [] });
      console.log(`✅ Created default album: ${name}`);
    }
  }
};

// ===== Initialize App =====
const initializeApp = async () => {
  await connectDB();
  await importRoutes();
  const models = await importModels();
  await ensureDefaultAlbums(models.GalleryAlbum);

  // ===== Debug Routes =====
  app.get('/api/debug/routes', (req, res) => res.json({
    success: true,
    message: 'Debug route working',
    routes: {
      auth: '/api/auth',
      quotes: '/api/quotes',
      gallery: '/api/gallery',
      messages: '/api/messages',
      feedback: '/api/feedback',
      images: '/api/images'
    },
    timestamp: new Date().toISOString()
  }));

  app.get('/api/debug/auth', (req, res) => res.json({
    authStatus: 'Available',
    environment: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Missing',
    timestamp: new Date().toISOString()
  }));

  // ===== Mount Routes =====
  app.use('/api/auth', authRoutes);
  app.use('/api/quotes', quoteRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/images', imageRoutes);

  // ===== Static Folders =====
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  app.use('/uploads/gallery', express.static(path.join(__dirname, 'uploads', 'gallery')));

  // ===== API Info =====
  app.get('/api', (req, res) =>
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
      },
      environment: process.env.NODE_ENV
    })
  );

  // ===== Health Check =====
  app.get('/api/health', (req, res) =>
    res.json({
      status: 'OK',
      database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    })
  );

  // ===== Serve React in Production =====
  if (process.env.NODE_ENV === 'production') {
    const possiblePaths = [
      path.join(__dirname, '../../black-pearl-frontend/build'),
      path.join(__dirname, '../black-pearl-frontend/build'),
      path.join(__dirname, 'black-pearl-frontend/build')
    ];
    let frontendPath = possiblePaths.find(p => fs.existsSync(p));

    if (frontendPath) {
      app.use(express.static(frontendPath));
      app.get('*', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
      console.log('✅ React frontend serving enabled');
    } else {
      console.log('❌ React build not found, serving fallback');
      app.get('/', (req, res) => res.send('<h1>Backend running - frontend not found</h1>'));
    }
  }

  // ===== Error Handling =====
  app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      timestamp: new Date().toISOString()
    });
  });
};

// ===== Start Server with Retry =====
const startServer = async (port = process.env.PORT || 5000, maxAttempts = 5) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await initializeApp();
      return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
          console.log(`🚀 Server running on port ${port}`);
          console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
          resolve(server);
        }).on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} busy, retrying ${port + 1}...`);
            port++;
            reject(err);
          } else reject(err);
        });
      });
    } catch (err) {
      if (attempt === maxAttempts) {
        console.error(`❌ Failed to start after ${maxAttempts} attempts`);
        process.exit(1);
      }
    }
  }
};

startServer().catch((error) => {
  console.error('❌ Server failed:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
