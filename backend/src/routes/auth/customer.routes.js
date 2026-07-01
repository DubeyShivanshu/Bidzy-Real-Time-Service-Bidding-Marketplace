/**
 * Customer Authentication Routes
 *
 * Routes:
 *  POST   /register        — Local registration (name, email, phone, password)
 *  POST   /login           — Local login → JWT
 *  GET    /google          — Initiate Google OAuth flow
 *  GET    /google/callback — Google OAuth callback → JWT
 *  POST   /logout          — Invalidate session / clear cookie
 *  GET    /me              — Get current authenticated customer profile
 */

import { Router } from 'express';
import passport from 'passport';
import * as customerController from '../../controllers/auth/customer.controller.js';
import * as avatarController from '../../controllers/auth/avatar.controller.js';
import { protect } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { authorize } from '../../middleware/role.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, customerController.register);
router.post('/login', authLimiter, customerController.login);
// Initiate Google OAuth flow
router.get('/google', (req, res, next) => {
  const hasCreds = process.env.GOOGLE_CLIENT_ID && 
                    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id';
  
  if (!hasCreds) {
    // Development fallback mock Google OAuth login
    console.log('🤖 Google credentials missing. Using Mock Google OAuth Login.');
    return customerController.mockGoogleLogin(req, res, next);
  }
  return passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google OAuth callback
router.get('/google/callback', (req, res, next) => {
  const hasCreds = process.env.GOOGLE_CLIENT_ID && 
                    process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id';

  if (!hasCreds) {
    return customerController.mockGoogleCallback(req, res, next);
  }
  return passport.authenticate('google', { session: false })(req, res, next);
}, customerController.googleCallback);
router.post('/logout', protect, authorize('customer'), customerController.logout);
router.get('/me', protect, authorize('customer'), customerController.getMe);
router.put('/me', protect, authorize('customer'), customerController.updateProfile);

router.post('/avatar', protect, authorize('customer'), upload.single('avatar'), avatarController.uploadAvatar);
router.delete('/avatar', protect, authorize('customer'), avatarController.deleteAvatar);

export default router;
