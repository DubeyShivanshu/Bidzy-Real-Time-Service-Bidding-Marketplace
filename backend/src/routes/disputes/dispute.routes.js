/**
 * Dispute Routes
 *
 * Routes:
 *  POST   /      — Raise a dispute on a booking (Customer or Provider)
 *  GET    /my    — Get disputes raised by current user
 *  GET    /:id   — Get single dispute by ID (Auth — own disputes only)
 */

import { Router } from 'express';
import * as disputeController from '../../controllers/disputes/dispute.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.post('/', protect, authorize('customer', 'provider'), disputeController.raiseDispute);
router.get('/my', protect, authorize('customer', 'provider'), disputeController.getMyDisputes);
router.get('/booking/:bookingId', protect, authorize('customer', 'provider', 'admin'), disputeController.getDisputeByBookingId);
router.get('/:id', protect, authorize('customer', 'provider', 'admin'), disputeController.getDisputeById);

export default router;
