/**
 * Express Application Factory
 *
 * Responsibilities:
 *  - Create and configure Express app
 *  - Register global middleware (morgan, cors, json, session, passport)
 *  - Mount all API routes under /api
 *  - Register global error handler
 */

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';
import router from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import path from 'path';

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
);

// Body parsing
// Raw body needed for Razorpay webhook HMAC verification
app.use('/api/wallet/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Fallback for missing local files so it doesn't return the JSON API 404 error
app.use('/uploads', (_req, res) => {
  res.status(404).send('File not found. This local file may have been deleted during the recent migration to Cloudinary.');
});

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Session (required for Passport Google OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'bidzy_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'Bidzy API' }));

// API Routes
app.use('/api', router);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;

