import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import helmet from 'helmet'; // Import helmet
import csurf from 'csurf'; // Import csurf
import cookieParser from 'cookie-parser'; // Import cookie-parser
import rateLimit from 'express-rate-limit'; // Import express-rate-limit

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Use Helmet to secure HTTP headers
app.use(helmet());

// Use cookie-parser middleware
app.use(cookieParser());

// Use csurf middleware
app.use(csurf({ cookie: true }));

// ===== Enhanced Debugging Middleware =====
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
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Present' : 'Missing');

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

// Import routes using dynamic imports
let authRoutes, quoteRoutes, galleryRoutes, messageRoutes, feedbackRoutes, imageRoutes;

// Dynamic import for routes
const importRoutes = async () => {
  try {
    authRoutes = (await import('./routes/auth.js')).default;
    quoteRoutes = (await import('./routes/quotes.js')).default;
    galleryRoutes = (await import('./routes/galleryRoutes.js')).default; // Added galleryRoutes
    messageRoutes = (await import('./routes/messageRoutes.js')).default;
    feedbackRoutes = (await import('./routes/feedbackRoutes.js')).default;
    imageRoutes = (await import('./routes/imageRoutes.js')).default; // Added imageRoutes
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
  try {
    // Connect to database first
    await connectDB();

    // Import routes
    await importRoutes();

    // Import models and ensure default albums
    const models = await importModels();
    await ensureDefaultAlbums(models.GalleryAlbum);

    // ===== Debug Routes =====
    app.get('/api/debug/routes', (req, res) => {
      res.json({
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
      });
    });

    app.get('/api/debug/auth', (req, res) => res.json({
      authStatus: 'Available',
      environment: process.env.NODE_ENV,
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Missing',
      timestamp: new Date().toISOString()
    }));

    // Rate limiting for login attempts
    const loginLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // Max 5 requests per 15 minutes
      message: 'Too many login attempts from this IP, please try again after 15 minutes',
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

    // Apply rate limiting to the login route
    app.use('/api/auth/login', loginLimiter);

    // General API rate limiting for all other /api routes
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Max 100 requests per 15 minutes for other APIs
      message: 'Too many requests from this IP, please try again after 15 minutes',
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Apply general API rate limiting to all /api routes except login
    app.use('/api/', apiLimiter);

    // CSRF token handling for forms/cookies-based login
    app.use((req, res, next) => {
      if (req.method === 'GET') {
        res.cookie('XSRF-TOKEN', req.csrfToken());
      }
      next();
    });

    // ===== Mount Routes =====
    app.use('/api/auth', authRoutes);
    app.use('/api/quotes', quoteRoutes);
    app.use('/api/gallery', galleryRoutes);
    app.use('/api/messages', messageRoutes);
    app.use('/api/feedback', feedbackRoutes);
    app.use('/api/images', imageRoutes);

    // ===== Static Folders =====
    const uploadsPath = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsPath)) {
      app.use('/uploads', express.static(uploadsPath));
    }
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
          uploads: '/uploads',
          debug: '/api/debug'
        },
        environment: process.env.NODE_ENV
      });
    });

    // ===== Health Check =====
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        memory: process.memoryUsage(),
        uptime: process.uptime()
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
                .debug-info {
                  background: rgba(0,0,0,0.3);
                  padding: 15px;
                  border-radius: 5px;
                  margin: 15px 0;
                  text-align: left;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🚀 Black Pearl Tours - Backend Running</h1>
                <p>Backend API is running successfully!</p>
                <p>React frontend build was not found.</p>
                
                <div class="debug-info">
                  <h3>Debug Information:</h3>
                  <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
                  <p><strong>Database:</strong> ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}</p>
                  <p><strong>Time:</strong> ${new Date().toISOString()}</p>
                </div>
                
                <div class="endpoints">
                  <h3>Available API Endpoints:</h3>
                  <ul>
                    <li><a href="/api">API Status</a></li>
                    <li><a href="/api/health">Health Check</a></li>
                    <li><a href="/api/debug/routes">Debug Routes</a></li>
                    <li><a href="/api/debug/auth">Auth Debug</a></li>
                    <li><a href="/api/quotes">Quotes API</a></li>
                    <li><a href="/api/auth">Auth API</a></li>
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
          debug: '/debug/paths',
          authDebug: '/api/debug/auth',
          routesDebug: '/api/debug/routes'
        }
      }));

      app.get('/api/hello', (req, res) => res.json({ msg: 'hi from development' }));
    }
  } catch (error) {
    console.error('❌ Error during app initialization:', error);
    process.exit(1);
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

// ===== Start Server with Port Retry Logic =====
const startServer = async (port = process.env.PORT || 5000, maxAttempts = 5) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await initializeApp();

      return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
          const actualPort = server.address().port;
          console.log(`🚀 Server running on port ${actualPort}`);
          console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
          console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

          if (process.env.NODE_ENV === 'production') {
            console.log('🔧 Production mode: React frontend should be served');
          } else {
            console.log('💻 Development mode: React runs on localhost:3000');
          }

          console.log('🔍 Debug endpoints available:');
          console.log(`   - http://localhost:${actualPort}/api/debug/routes`);
          console.log(`   - http://localhost:${actualPort}/api/debug/auth`);
          console.log(`   - http://localhost:${actualPort}/api/debug/test`);
          console.log(`   - http://localhost:${actualPort}/debug/paths`);

          resolve(server);
        }).on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${port} is busy, trying ${port + 1}... (Attempt ${attempt}/${maxAttempts})`);
            port++;
            reject(err);
          } else {
            console.error('❌ Server error:', err);
            reject(err);
          }
        });
      });
    } catch (err) {
      if (attempt === maxAttempts) {
        console.error(`❌ Failed to start server after ${maxAttempts} attempts`);
        process.exit(1);
      }
      // Continue to next attempt
    }
  }
};

// Start the server
startServer(process.env.PORT || 5001).catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// ===== Process-level diagnostics =====
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
  process.exit(1);
});
