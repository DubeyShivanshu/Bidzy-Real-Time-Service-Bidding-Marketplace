/**
 * Refund Policy Service
 *
 * Responsibilities:
 *  - calculateRefundPercent(bookingCreatedAt) — Apply time-based refund policy:
 *    * Under 15 minutes:   100% refund
 *    * 15–30 minutes:       50% refund
 *    * After 30 minutes:     0% refund
 *  - processRefund(bookingId) — Calculate percent, call escrow.refundEscrow, update booking status
 */

import Booking from '../../models/Booking.js';
import { refundEscrow } from '../wallet/escrow.service.js';
import { BOOKING_STATUS } from '../../config/constants.js';

/**
 * calculateRefundPercent
 * @param {Date} bookingCreatedAt
 * @returns {number} refund percentage (0, 50, or 100)
 */
export const calculateRefundPercent = (bookingCreatedAt) => {
  const now = new Date();
  const createdAt = new Date(bookingCreatedAt);
  const elapsedMinutes = (now - createdAt) / (1000 * 60);

  if (elapsedMinutes <= 15) return 100;
  if (elapsedMinutes <= 30) return 50;
  return 0;
};

/**
 * processRefund — Orchestrate cancellation refund
 * @param {string} bookingId
 * @param {object} session — Optional MongoDB session
 * @returns {{ refundPercent, refundAmount, booking }}
 */
export const processRefund = async (bookingId, session = null) => {
  const booking = await Booking.findById(bookingId).session(session);
  if (!booking) throw new Error(`Booking ${bookingId} not found`);

  const refundPercent = calculateRefundPercent(booking.createdAt);

  const { refundAmount } = await refundEscrow(bookingId, refundPercent, session);

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      status: BOOKING_STATUS.CANCELLED,
      cancelledAt: new Date(),
    },
    { new: true, session }
  );

  return { refundPercent, refundAmount, booking: updatedBooking };
};

export default { calculateRefundPercent, processRefund };

