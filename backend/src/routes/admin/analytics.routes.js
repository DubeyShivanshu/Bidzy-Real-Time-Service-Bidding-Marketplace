/**
 * routes/admin/analytics.routes.js — Admin Analytics Routes
 *
 * Routes:
 *  GET    /revenue     — Revenue breakdown (daily/weekly/monthly)
 *                        Returns: platform fees, top-ups, refunds, escrow balance
 *  GET    /overview    — High-level platform growth stats
 */

import { Router } from 'express';
import * as analyticsController from '../../controllers/admin/analytics.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.get('/revenue', protect, authorize('admin'), analyticsController.getRevenueAnalytics);
router.get('/overview', protect, authorize('admin'), analyticsController.getPlatformOverview);

export default router;
