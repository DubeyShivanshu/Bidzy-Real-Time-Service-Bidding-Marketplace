/**
 * controllers/disputes/dispute.controller.js — Dispute Controller
 *
 * Responsibilities:
 *  - raiseDispute: Validate booking ownership, create Dispute record
 *  - getMyDisputes: Return disputes raised by authenticated user
 *  - getDisputeById: Return single dispute (only if raised by caller or admin)
 *  - getDisputeByBookingId: Return dispute for a specific booking
 */

import Dispute from '../../models/Dispute.js';
import Booking from '../../models/Booking.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';

export const raiseDispute = async (req, res, next) => {
  try {
    const { bookingId, reason } = req.body;

    if (!bookingId || !reason) {
      return errorResponse(res, 'Booking ID and reason are required', 400);
    }

    // Verify booking exists and user is part of it
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    if (
      booking.customerId.toString() !== req.user._id.toString() &&
      booking.providerId.toString() !== req.user._id.toString()
    ) {
      return errorResponse(res, 'You are not authorized to raise a dispute for this booking', 403);
    }

    // Only allow disputes on active or completed bookings
    if (booking.status === 'cancelled') {
      return errorResponse(res, 'Cannot raise a dispute on a cancelled booking', 400);
    }

    // Check if dispute already exists
    const existingDispute = await Dispute.findOne({ bookingId });
    if (existingDispute) {
      return errorResponse(res, 'A dispute already exists for this booking', 400);
    }

    // Create dispute
    const dispute = await Dispute.create({
      bookingId,
      raisedBy: req.user._id,
      raisedByRole: req.user.role,
      reason,
    });

    return successResponse(res, dispute, 'Dispute raised successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getMyDisputes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // First find all bookings involving this user
    const userBookings = await Booking.find({
      $or: [{ customerId: req.user._id }, { providerId: req.user._id }]
    }).select('_id');
    
    const bookingIds = userBookings.map(b => b._id);

    const query = { bookingId: { $in: bookingIds } };

    const disputes = await Dispute.find(query)
      .populate({
        path: 'bookingId',
        select: 'jobId status escrowStatus totalAmount customerId providerId',
        populate: [
          { path: 'customerId', select: 'name' },
          { path: 'providerId', select: 'name' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Dispute.countDocuments(query);

    return paginatedResponse(res, disputes, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate({
        path: 'bookingId',
        select: 'jobId status escrowStatus totalAmount customerId providerId',
        populate: [
          { path: 'customerId', select: 'name' },
          { path: 'providerId', select: 'name' }
        ]
      })
      .populate('resolvedBy', 'name');

    if (!dispute) {
      return errorResponse(res, 'Dispute not found', 404);
    }

    if (
      dispute.raisedBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return errorResponse(res, 'Not authorized to view this dispute', 403);
    }

    return successResponse(res, dispute);
  } catch (error) {
    next(error);
  }
};

export const getDisputeByBookingId = async (req, res, next) => {
  try {
    const dispute = await Dispute.findOne({ bookingId: req.params.bookingId })
      .populate('resolvedBy', 'name');

    if (!dispute) {
      return errorResponse(res, 'No dispute found for this booking', 404);
    }

    // Must be part of the booking or admin
    const booking = await Booking.findById(req.params.bookingId);
    if (
      booking &&
      booking.customerId.toString() !== req.user._id.toString() &&
      booking.providerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return errorResponse(res, 'Not authorized to view this dispute', 403);
    }

    return successResponse(res, dispute);
  } catch (error) {
    next(error);
  }
};
