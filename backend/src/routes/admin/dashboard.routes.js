/**
 * routes/admin/dashboard.routes.js — Admin Dashboard Routes
 *
 * Routes:
 *  GET    /   — Platform-wide metrics dashboard (Admin only)
 *
 * Metrics returned:
 *  Total Customers, Total Providers, Verified Providers,
 *  Total Jobs, Open Jobs, Completed Jobs, Cancelled Jobs,
 *  Total Bookings, Active Bookings, Total Disputes,
 *  Revenue (platform fees), Pending Escrow
 */

import { Router } from 'express';
import * as dashboardController from '../../controllers/admin/dashboard.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.get('/', protect, authorize('admin'), dashboardController.getDashboardMetrics);

export default router;
