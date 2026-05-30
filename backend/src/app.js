const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { sendError } = require('./utils/response');

const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: false // Allows serving static uploads to frontend if needed
}));

// CORS Configuration
app.use(cors({
  origin: '*', // Allow all origins for local dev/testing
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
    data: null
  }
});
app.use('/api', limiter);

// Serve uploads folder statically (accessible via /uploads/resumes/...)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// Base route status check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy', data: { time: new Date() } });
});

// 404 Route handler
app.use((req, res, next) => {
  return sendError(res, `Route ${req.originalUrl} not found`, 404);
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, statusCode);
});

module.exports = app;
