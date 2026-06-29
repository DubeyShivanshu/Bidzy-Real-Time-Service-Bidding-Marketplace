/**
 * routes/admin/disputes.routes.js — Admin Dispute Management Routes
 *
 * Routes:
 *  GET    /           — List all disputes (filterable by status)
 *  GET    /:id        — Get dispute details with booking, chat, payment records
 *  PATCH  /:id/resolve  — Resolve a dispute (with optional refund)
 *  GET    /chat/:bookingId — View booking chat (read-only, for dispute investigation)
 */

import { Router } from 'express';
import * as disputesController from '../../controllers/admin/disputes.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.get('/', protect, authorize('admin'), disputesController.getAllDisputes);
// IMPORTANT: specific routes MUST come before wildcard /:id routes
router.get('/chat/:bookingId', protect, authorize('admin'), disputesController.getBookingChatForDispute);
router.get('/:id', protect, authorize('admin'), disputesController.getDisputeById);
router.patch('/:id/resolve', protect, authorize('admin'), disputesController.resolveDispute);

export default router;
