/**
 * routes/auth/provider.routes.js — Provider Authentication Routes
 *
 * Routes:
 *  POST   /register  — Provider registration (name, email, phone, city, speciality, password)
 *  POST   /login     — Provider login → JWT
 *  POST   /logout    — Logout (protected)
 *  GET    /me        — Get current authenticated provider profile
 *
 * Note: No Google OAuth for providers.
 */

import { Router } from 'express';
import * as providerController from '../../controllers/auth/provider.controller.js';
import * as avatarController from '../../controllers/auth/avatar.controller.js';
import { protect } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { authorize } from '../../middleware/role.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, providerController.register);
router.post('/login', authLimiter, providerController.login);
router.post('/logout', protect, authorize('provider'), providerController.logout);
router.get('/me', protect, authorize('provider'), providerController.getMe);
router.put('/me', protect, authorize('provider'), providerController.updateProfile);

router.post('/avatar', protect, authorize('provider'), upload.single('avatar'), avatarController.uploadAvatar);
router.delete('/avatar', protect, authorize('provider'), avatarController.deleteAvatar);

export default router;
