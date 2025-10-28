import express, { json, urlencoded } from 'express';
import { static as serveStatic } from 'express';
import { connect, disconnect } from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
// Load the environment variables
dotenv.config();

// IMPORT ROUTERS using dynamic import for ES module support
import authRouter from './routes/auth.js';
import applicationsRouter from './routes/applications.js';
import grievancesRouter from './routes/grievances.js';
import schemesRouter from './routes/schemes.js';
import servicesRouter from './routes/services.js';
import announcementsRouter from './routes/announcements.js';
import adminRouter from './routes/admin.js';
import usersRouter from './routes/users.js';
import publicSchemesRouter from './routes/publicSchemes.js';


const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Set default environment variables if not provided
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/e-gram-panchayat';
  console.log('⚠️  MONGODB_URI not set, using default:', process.env.MONGODB_URI);
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your_super_secret_jwt_key_here_make_it_very_long_and_secure_for_development_only';
  console.log('⚠️  JWT_SECRET not set, using default (NOT SECURE FOR PRODUCTION)');
}
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// --------------------------------------------------
// CORS configuration
// --------------------------------------------------
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:3000']; 

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors()); 

// --------------------------------------------------

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100000, // Increased limit
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});
app.use('/api/', limiter);


// Body parsing middleware
app.use(json({ limit: '10mb' }));
app.use(urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/uploads', serveStatic('uploads'));

// MongoDB connection
connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('💡 Make sure MongoDB is running or use MongoDB Atlas');
  console.log('🚀 Server will continue running without database connection');
});

// --------------------------------------------------
// Routes - Using imported ES Modules
// --------------------------------------------------

app.use('/api/auth', authRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/grievances', grievancesRouter);
app.use('/api/admin/schemes', schemesRouter);
app.use('/api/services', servicesRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/schemes', publicSchemesRouter);
app.use('/api/admin', adminRouter);
app.use('/api/users', usersRouter);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

// Handle server startup errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please stop the existing server or use a different port.`);
  } else {
    console.error('❌ Server startup error:', err.message);
  }
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error('Stack:', err.stack);
  // Don't exit the process, just log the error
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Graceful shutdown
const shutdown = () => {
    console.log('🛑 Shutting down gracefully...');
    server.close(() => {
        disconnect(() => {
            console.log('✅ MongoDB disconnected');
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
    setTimeout(() => {
        console.error('⚠️ Could not close connections gracefully, forcing shutdown.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', shutdown);

// Only exit on manual shutdown (Ctrl+C), not on errors
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT (Ctrl+C). Shutting down gracefully...');
  shutdown();
});

export default app;
