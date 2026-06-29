/**
 * routes/auth/admin.routes.js — Admin Authentication Routes
 *
 * Routes:
 *  POST   /login   — Admin login → JWT (email + password)
 *  POST   /logout  — Logout (protected)
 *  GET    /me      — Get current authenticated admin profile
 *
 * Note: Admin accounts are seeded — no public registration endpoint.
 * No Google OAuth for admins.
 */

import { Router } from 'express';
import * as adminController from '../../controllers/auth/admin.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';
import { authLimiter } from '../../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authLimiter, adminController.login);
router.post('/logout', protect, authorize('admin'), adminController.logout);
router.get('/me', protect, authorize('admin'), adminController.getMe);

export default router;
