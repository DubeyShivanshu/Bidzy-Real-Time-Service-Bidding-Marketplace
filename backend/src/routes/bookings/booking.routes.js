/**
 * routes/bookings/booking.routes.js — Booking Routes
 *
 * Routes:
 *  GET    /customer/my   — Get current customer's bookings
 *  GET    /provider/my   — Get current provider's bookings
 *  GET    /:id           — Get single booking details (Customer or Provider who owns it)
 *  PATCH  /:id/complete  — Mark booking as completed (Provider)
 *  PATCH  /:id/cancel    — Cancel booking + apply refund policy (Customer or Provider)
 */

import { Router } from 'express';
import * as bookingController from '../../controllers/bookings/booking.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.get('/customer/my', protect, authorize('customer'), bookingController.getCustomerBookings);
router.get('/provider/my', protect, authorize('provider'), bookingController.getProviderBookings);
router.get('/:id', protect, authorize('customer', 'provider', 'admin'), bookingController.getBookingById);
router.patch('/:id/complete', protect, authorize('customer'), bookingController.completeBooking);
router.patch('/:id/cancel', protect, authorize('customer', 'provider'), bookingController.cancelBooking);

export default router;
