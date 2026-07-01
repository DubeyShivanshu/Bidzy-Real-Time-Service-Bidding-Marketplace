/**
 * Bid Routes
 *
 * Routes:
 *  POST   /              — Submit a bid on a job (Provider only)
 *  GET    /job/:jobId    — Get all bids for a specific job (Customer who owns the job)
 *  GET    /provider/my   — Get current provider's submitted bids
 *  PATCH  /:id/accept    — Accept a bid (Customer — triggers booking creation)
 *  PATCH  /:id/reject    — Reject a specific bid (Customer)
 */

import { Router } from 'express';
import * as bidController from '../../controllers/bids/bid.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.post('/', protect, authorize('provider'), bidController.submitBid);
router.get('/job/:jobId', protect, authorize('customer', 'provider'), bidController.getBidsForJob);
router.get('/provider/my', protect, authorize('provider'), bidController.getMyBids);
router.patch('/:id/accept', protect, authorize('customer'), bidController.acceptBid);
router.patch('/:id/reject', protect, authorize('customer'), bidController.rejectBid);

export default router;
