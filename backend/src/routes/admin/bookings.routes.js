/**
 * routes/admin/bookings.routes.js — Admin Booking Management Routes
 *
 * Routes:
 *  GET    /       — List all bookings (paginated, filterable by status/date)
 *  GET    /:id    — Get full booking details with job, bid, payment, chat link
 */

import { Router } from 'express';
import * as bookingsController from '../../controllers/admin/bookings.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.get('/', protect, authorize('admin'), bookingsController.getAllBookings);
router.get('/:id', protect, authorize('admin'), bookingsController.getBookingById);

export default router;
