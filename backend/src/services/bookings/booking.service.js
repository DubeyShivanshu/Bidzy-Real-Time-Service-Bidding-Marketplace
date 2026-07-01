/**
 * Booking Service
 *
 * Responsibilities:
 *  - createBooking(jobId, bidId, customerId, providerId, basePrice) — Orchestrate booking creation:
 *    1. Calculate securityDeposit, platformFee, totalAmount from env percents
 *    2. Verify customer wallet balance is sufficient
 *    3. Create Booking document
 *    4. Call holdEscrow to debit customer wallet
 *  - getBookingWithDetails(bookingId) — Populate job, bid, customer, provider
 */

import mongoose from 'mongoose';
import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import { holdEscrow } from '../wallet/escrow.service.js';
import { ESCROW_STATUS, BOOKING_STATUS } from '../../config/constants.js';

const FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT) || 5;
const DEPOSIT_PERCENT = Number(process.env.SECURITY_DEPOSIT_PERCENT) || 10;

/**
 * createBooking — Full booking creation with escrow debit
 */
export const createBooking = async (jobId, bidId, customerId, providerId, basePrice) => {
  const securityDeposit = Math.round(basePrice * DEPOSIT_PERCENT / 100);
  const platformFee = Math.round(basePrice * FEE_PERCENT / 100);
  const totalAmount = basePrice + securityDeposit + platformFee;

  // Validate wallet balance before touching DB
  const customer = await User.findById(customerId).select('walletBalance');
  if (!customer) throw new Error('Customer not found');
  if (customer.walletBalance < totalAmount) {
    const err = new Error('Insufficient wallet balance to accept this bid');
    err.statusCode = 400;
    err.code = 'INSUFFICIENT_BALANCE';
    err.required = totalAmount;
    err.available = customer.walletBalance;
    throw err;
  }

  // Use a MongoDB session for atomicity
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [booking] = await Booking.create(
      [
        {
          jobId,
          bidId,
          customerId,
          providerId,
          basePrice,
          securityDeposit,
          platformFee,
          totalAmount,
          status: BOOKING_STATUS.ACTIVE,
          escrowStatus: ESCROW_STATUS.HELD,
        },
      ],
      { session }
    );

    // Hold the escrow (debits customer wallet + logs transaction)
    await holdEscrow(booking._id.toString(), session);

    await session.commitTransaction();
    session.endSession();

    return booking;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/**
 * getBookingWithDetails — Populate all related models for detail view
 */
export const getBookingWithDetails = async (bookingId) => {
  return Booking.findById(bookingId)
    .populate('jobId', 'service description budget urgency address location status')
    .populate('bidId', 'price eta message providerSnapshot status')
    .populate('customerId', 'name email phone city')
    .populate('providerId', 'name email phone city rating totalReviews speciality verified');
};

export default { createBooking, getBookingWithDetails };

