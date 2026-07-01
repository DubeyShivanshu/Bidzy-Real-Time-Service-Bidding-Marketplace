/**
 * Admin Booking Management Routes
 */

import { Router } from 'express';
import * as bookingsController from '../../controllers/admin/bookings.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.get('/', protect, authorize('admin'), bookingsController.getAllBookings);
router.get('/:id', protect, authorize('admin'), bookingsController.getBookingById);

export default router;
