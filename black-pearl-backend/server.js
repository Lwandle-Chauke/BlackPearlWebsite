import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

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

    // ===== Debug Route to Check File Structure =====
    app.get('/debug/paths', (req, res) => {
      const paths = {
        __dirname: __dirname,
        currentDir: process.cwd(),
        frontendPath1: path.join(__dirname, '../../black-pearl-frontend/build'),
        frontendPath2: path.join(__dirname, '../black-pearl-frontend/build'),
        frontendPath3: path.join(__dirname, 'black-pearl-frontend/build')
      };
      
      // Check if paths exist
      for (const [key, value] of Object.entries(paths)) {
        if (typeof value === 'string') {
          paths[key + '_exists'] = fs.existsSync(value);
        }
      }
      
      res.json(paths);
    });

    // ===== Serve React Frontend in Production =====
    if (process.env.NODE_ENV === 'production') {
      // Try multiple possible paths for the React build
      const possiblePaths = [
        path.join(__dirname, '../../black-pearl-frontend/build'),
        path.join(__dirname, '../black-pearl-frontend/build'),
        path.join(__dirname, 'black-pearl-frontend/build')
      ];
      
      let frontendPath = null;
      for (const buildPath of possiblePaths) {
        if (fs.existsSync(buildPath)) {
          frontendPath = buildPath;
          console.log('✅ Found React build at:', frontendPath);
          break;
        }
      }
      
      if (frontendPath) {
        app.use(express.static(frontendPath));
        
        // AFTER defining routes, catch all other requests and return the React app
        app.get('*', (req, res) => {
          res.sendFile(path.join(frontendPath, 'index.html'));
        });
        
        console.log('✅ React frontend serving enabled');
      } else {
        console.log('❌ React build not found in any expected location');
        
        // Serve a basic HTML page as fallback for root route
        app.get('/', (req, res) => {
          res.send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Black Pearl Tours</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0;
                  padding: 40px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  min-height: 100vh;
                }
                .container { 
                  max-width: 800px; 
                  margin: 0 auto; 
                  text-align: center;
                  background: rgba(255,255,255,0.1);
                  padding: 40px;
                  border-radius: 10px;
                  backdrop-filter: blur(10px);
                }
                h1 { font-size: 2.5em; margin-bottom: 20px; }
                p { font-size: 1.2em; margin-bottom: 15px; }
                a { 
                  color: #fff; 
                  text-decoration: underline;
                  font-weight: bold;
                }
                .endpoints {
                  text-align: left;
                  background: rgba(255,255,255,0.2);
                  padding: 20px;
                  border-radius: 5px;
                  margin: 20px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🚀 Black Pearl Tours</h1>
                <p>Backend API is running successfully!</p>
                <p>Frontend is being built or deployed separately.</p>
                
                <div class="endpoints">
                  <h3>Available API Endpoints:</h3>
                  <ul>
                    <li><a href="/api">API Status</a></li>
                    <li><a href="/api/health">Health Check</a></li>
                    <li><a href="/api/quotes">Quotes API</a></li>
                    <li><a href="/api/auth">Auth API</a></li>
                    <li><a href="/api/gallery">Gallery API</a></li>
                    <li><a href="/debug/paths">Debug Paths</a></li>
                  </ul>
                </div>
                
                <p><strong>Note:</strong> The React frontend build folder was not found. Please check the build process.</p>
              </div>
            </body>
            </html>
          `);
        });
      }
    } else {
      // Development mode - simple test routes
      app.get('/', (req, res) => res.json({ 
        msg: 'Black Pearl Tours API is running in development mode',
        frontend: 'Run React app separately on localhost:3000',
        endpoints: {
          api: '/api',
          health: '/api/health',
          debug: '/debug/paths'
        }
      }));
      
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

    // ===== 404 Fallback (only if not in production with React) =====
    if (process.env.NODE_ENV !== 'production') {
      app.use((req, res) => {
        res.status(404).json({
          success: false,
          error: `Route ${req.originalUrl} not found`,
          note: 'In production, React handles routing'
        });
      });
    }

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
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🔧 Production mode: React frontend should be served');
    } else {
      console.log('💻 Development mode: React runs on localhost:3000');
    }
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