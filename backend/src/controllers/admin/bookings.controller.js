/**
 * controllers/admin/bookings.controller.js — Admin Booking Controller
 *
 * Responsibilities:
 *  - getAllBookings: Paginated list filterable by status, customer, provider, date range
 *  - getBookingById: Full booking details (job, bid, payment breakdown, transactions)
 */

import Booking from '../../models/Booking.js';
import Transaction from '../../models/Transaction.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';

export const getAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;

    const bookings = await Booking.find(query)
      .populate('customerId', 'name email')
      .populate('providerId', 'name email')
      .populate('jobId', 'service description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    return paginatedResponse(res, bookings, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('providerId', 'name email phone')
      .populate('jobId', 'service description status')
      .populate('bidId', 'price message eta');

    if (!booking) return errorResponse(res, 'Booking not found', 404);

    const transactions = await Transaction.find({ bookingId: booking._id }).sort({ createdAt: -1 });

    return successResponse(res, { booking, transactions });
  } catch (error) {
    next(error);
  }
};
