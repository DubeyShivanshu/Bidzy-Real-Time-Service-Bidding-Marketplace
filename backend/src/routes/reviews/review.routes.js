/**
 * routes/reviews/review.routes.js — Review Routes
 *
 * Routes:
 *  POST   /                      — Submit a review (Customer — after booking completion)
 *  GET    /provider/:providerId  — Get all reviews for a provider (Public)
 *  GET    /booking/:bookingId    — Get review for a specific booking (Auth)
 */

import { Router } from 'express';
import * as reviewController from '../../controllers/reviews/review.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.post('/', protect, authorize('customer'), reviewController.submitReview);
router.get('/provider/:providerId', reviewController.getProviderReviews);
router.get('/booking/:bookingId', protect, authorize('customer', 'provider', 'admin'), reviewController.getBookingReview);

export default router;
