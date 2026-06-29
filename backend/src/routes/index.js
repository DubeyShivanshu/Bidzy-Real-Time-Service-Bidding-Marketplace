/**
 * routes/index.js — Master API Router
 *
 * Responsibilities:
 *  - Mount all feature routers under their respective prefixes
 *  - Single import point for app.js
 *  - Apply apiLimiter to all routes
 */

import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimiter.js';

// Auth routers
import customerAuthRoutes from './auth/customer.routes.js';
import providerAuthRoutes from './auth/provider.routes.js';
import adminAuthRoutes from './auth/admin.routes.js';

// Feature routers
import jobRoutes from './jobs/job.routes.js';
import bidRoutes from './bids/bid.routes.js';
import bookingRoutes from './bookings/booking.routes.js';
import chatRoutes from './chat/chat.routes.js';
import walletRoutes from './wallet/wallet.routes.js';
import providerRoutes from './providers/provider.routes.js';
import reviewRoutes from './reviews/review.routes.js';
import disputeRoutes from './disputes/dispute.routes.js';

// Admin routers
import adminDashboardRoutes from './admin/dashboard.routes.js';
import adminUsersRoutes from './admin/users.routes.js';
import adminProvidersRoutes from './admin/providers.routes.js';
import adminBookingsRoutes from './admin/bookings.routes.js';
import adminDisputesRoutes from './admin/disputes.routes.js';
import adminAnalyticsRoutes from './admin/analytics.routes.js';

const router = Router();

router.use(apiLimiter);

// Auth
router.use('/auth/customer', customerAuthRoutes);
router.use('/auth/provider', providerAuthRoutes);
router.use('/auth/admin', adminAuthRoutes);

// Features
router.use('/jobs', jobRoutes);
router.use('/bids', bidRoutes);
router.use('/bookings', bookingRoutes);
router.use('/chat', chatRoutes);
router.use('/wallet', walletRoutes);
router.use('/providers', providerRoutes);
router.use('/reviews', reviewRoutes);
router.use('/disputes', disputeRoutes);

// Admin
router.use('/admin/dashboard', adminDashboardRoutes);
router.use('/admin/users', adminUsersRoutes);
router.use('/admin/providers', adminProvidersRoutes);
router.use('/admin/bookings', adminBookingsRoutes);
router.use('/admin/disputes', adminDisputesRoutes);
router.use('/admin/analytics', adminAnalyticsRoutes);

export default router;
