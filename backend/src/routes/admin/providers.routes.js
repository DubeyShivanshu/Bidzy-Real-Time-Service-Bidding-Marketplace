/**
 * routes/admin/providers.routes.js — Admin Provider Management Routes
 *
 * Routes:
 *  GET    /                   — List all providers (with verification status filter)
 *  GET    /:id                — Get provider details with verification docs
 *  PATCH  /:id/verify         — Approve provider verification
 *  PATCH  /:id/reject         — Reject provider verification (with note)
 *  PATCH  /:id/suspend        — Suspend provider account
 */

import { Router } from 'express';
import * as providersController from '../../controllers/admin/providers.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.get('/', protect, authorize('admin'), providersController.getAllProviders);
router.get('/:id', protect, authorize('admin'), providersController.getProviderById);
router.patch('/:id/verify', protect, authorize('admin'), providersController.verifyProvider);
router.patch('/:id/reject', protect, authorize('admin'), providersController.rejectProvider);
router.patch('/:id/suspend', protect, authorize('admin'), providersController.suspendProvider);

export default router;
