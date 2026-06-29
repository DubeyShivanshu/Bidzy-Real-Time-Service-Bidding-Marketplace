/**
 * controllers/bookings/booking.controller.js — Booking Controller
 *
 * Responsibilities:
 *  - getCustomerBookings: Paginated list for authenticated customer
 *  - getProviderBookings: Paginated list for authenticated provider
 *  - getBookingById: Full booking details (job, bid, payment summary)
 *  - completeBooking: Mark complete → release escrow (provider paid, deposit returned)
 *  - cancelBooking: Cancel → apply time-based refund policy via refund.service.js
 */

import mongoose from 'mongoose';
import Booking from '../../models/Booking.js';
import { getIO } from '../../config/socket.js';
import { getBookingWithDetails } from '../../services/bookings/booking.service.js';
import { releaseEscrow } from '../../services/wallet/escrow.service.js';
import { processRefund } from '../../services/bookings/refund.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { BOOKING_STATUS, ESCROW_STATUS } from '../../config/constants.js';

export const getCustomerBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const filter = { customerId: req.user._id };
    if (status) filter.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('jobId', 'service description status')
        .populate('providerId', 'name rating speciality verified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return paginatedResponse(res, bookings, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getProviderBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const filter = { providerId: req.user._id };
    if (status) filter.status = status;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('jobId', 'service description status address')
        .populate('customerId', 'name city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Booking.countDocuments(filter),
    ]);

    return paginatedResponse(res, bookings, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await getBookingWithDetails(req.params.id);
    if (!booking) return errorResponse(res, 'Booking not found', 404);

    // Allow only involved parties to view
    const isCustomer = booking.customerId?._id?.toString() === req.user._id.toString();
    const isProvider = booking.providerId?._id?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return errorResponse(res, 'Not authorized to view this booking', 403);
    }

    return successResponse(res, booking);
  } catch (error) {
    next(error);
  }
};

export const completeBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 'Booking not found', 404);
    }

    // Only the customer can mark as complete
    if (booking.customerId.toString() !== req.user._id.toString()) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 'Only the customer can mark a booking as complete', 403);
    }

    if (booking.status !== BOOKING_STATUS.ACTIVE) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 'Only active bookings can be marked as complete', 400);
    }

    // Release escrow: pays provider + returns deposit to customer
    await releaseEscrow(booking._id.toString(), session);

    const updatedBooking = await Booking.findByIdAndUpdate(
      booking._id,
      {
        status: BOOKING_STATUS.COMPLETED,
        completedAt: new Date(),
      },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    // Emit real-time update to provider
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${booking.providerId.toString()}`).emit('booking:updated', { bookingId: booking._id, status: BOOKING_STATUS.COMPLETED });
        io.to(`booking:${booking._id.toString()}`).emit('booking:updated', { bookingId: booking._id, status: BOOKING_STATUS.COMPLETED });
        // Notify all admins to refresh their wallet balances globally
        io.to('admin').emit('wallet:update');
      }
    } catch (e) {
      console.warn('Real-time socket emit failed:', e.message);
    }

    return successResponse(res, updatedBooking, 'Booking marked as complete. Funds released to provider.');
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 'Booking not found', 404);
    }

    const isCustomer = booking.customerId.toString() === req.user._id.toString();
    const isProvider = booking.providerId.toString() === req.user._id.toString();

    if (!isCustomer && !isProvider) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 'Not authorized to cancel this booking', 403);
    }

    if (booking.status !== BOOKING_STATUS.ACTIVE) {
      await session.abortTransaction();
      session.endSession();
      return errorResponse(res, 'Only active bookings can be cancelled', 400);
    }

    // If provider cancels → full refund to customer
    let refundResult;
    if (isProvider) {
      const { refundEscrow } = await import('../../services/wallet/escrow.service.js');
      const result = await refundEscrow(booking._id.toString(), 100, session);
      const updatedBooking = await Booking.findByIdAndUpdate(
        booking._id,
        {
          status: BOOKING_STATUS.CANCELLED,
          cancelledAt: new Date(),
        },
        { new: true, session }
      );
      refundResult = { refundPercent: 100, refundAmount: result.refundAmount, booking: updatedBooking };
    } else {
      // Customer cancels → time-based refund policy
      refundResult = await processRefund(booking._id.toString(), session);
    }

    await session.commitTransaction();
    session.endSession();

    // Emit real-time update to both parties
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${booking.providerId.toString()}`).emit('booking:updated', { bookingId: booking._id, status: BOOKING_STATUS.CANCELLED });
        io.to(`user:${booking.customerId.toString()}`).emit('booking:updated', { bookingId: booking._id, status: BOOKING_STATUS.CANCELLED });
        io.to(`booking:${booking._id.toString()}`).emit('booking:updated', { bookingId: booking._id, status: BOOKING_STATUS.CANCELLED });
      }
    } catch (e) {
      console.warn('Real-time socket emit failed:', e.message);
    }

    return successResponse(
      res,
      { booking: refundResult.booking || booking, ...refundResult },
      `Booking cancelled. Refund of ₹${refundResult.refundAmount} (${refundResult.refundPercent}%) applied to your wallet.`
    );
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

