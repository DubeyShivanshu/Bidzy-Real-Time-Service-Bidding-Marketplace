/**
 * services/wallet/escrow.service.js — Escrow Service
 *
 * Responsibilities:
 *  - holdEscrow(bookingId, session) — Debit totalAmount from customer wallet on booking creation
 *  - releaseEscrow(bookingId, session) — On completion: credit provider + return deposit to customer
 *  - refundEscrow(bookingId, refundPercent, session) — On cancellation: partial/full refund to customer
 *
 * Escrow Flow:
 *  1. holdEscrow   → customer.wallet -= totalAmount  (debit transaction)
 *  2. releaseEscrow:
 *       provider.wallet += basePrice            (credit transaction)
 *       customer.wallet += securityDeposit      (deposit_return transaction)
 *       platform keeps platformFee (commission transaction logged)
 *  3. refundEscrow (cancellation):
 *       Refund = totalAmount * refundPercent / 100 → customer.wallet (refund transaction)
 *
 * All operations use MongoDB sessions for atomicity.
 */

import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import { creditWallet, debitWallet } from './wallet.service.js';
import { TRANSACTION_TYPES, ESCROW_STATUS, BOOKING_STATUS } from '../../config/constants.js';

/**
 * holdEscrow — Debit customer wallet for full booking amount
 */
export const holdEscrow = async (bookingId, session = null) => {
  const booking = await Booking.findById(bookingId).session(session);
  if (!booking) throw new Error('Booking not found for escrow hold');

  await debitWallet(
    booking.customerId,
    booking.totalAmount,
    `Escrow hold for booking #${booking._id}`,
    { bookingId: booking._id, type: TRANSACTION_TYPES.DEBIT },
    session
  );

  return booking;
};

/**
 * releaseEscrow — Release funds to provider and return deposit to customer
 */
export const releaseEscrow = async (bookingId, session = null) => {
  const booking = await Booking.findById(bookingId).session(session);
  if (!booking) throw new Error('Booking not found for escrow release');

  // 1. Credit basePrice to provider
  await creditWallet(
    booking.providerId,
    booking.basePrice,
    `Payment for booking #${booking._id}`,
    { bookingId: booking._id, type: TRANSACTION_TYPES.CREDIT },
    session
  );

  // 2. Return security deposit to customer
  await creditWallet(
    booking.customerId,
    booking.securityDeposit,
    `Security deposit returned for booking #${booking._id}`,
    { bookingId: booking._id, type: TRANSACTION_TYPES.DEPOSIT_RETURN },
    session
  );

  // 3. Platform keeps platformFee (credit to admin wallet)
  console.log(`[Escrow] Attempting to credit platformFee: ${booking.platformFee}`);
  const admin = await User.findOne({ role: 'admin' }).session(session);
  console.log(`[Escrow] Admin user found: ${admin ? admin._id : 'null'}`);
  
  if (admin && booking.platformFee > 0) {
    await creditWallet(
      admin._id,
      booking.platformFee,
      `Commission from booking #${booking._id}`,
      { bookingId: booking._id, type: TRANSACTION_TYPES.COMMISSION },
      session
    );
    console.log(`[Escrow] Successfully credited Admin wallet`);
  } else {
    console.log(`[Escrow] Did NOT credit Admin. Admin found: ${!!admin}, Fee: ${booking.platformFee}`);
  }

  // 4. Update booking escrow status
  booking.escrowStatus = ESCROW_STATUS.RELEASED;
  await booking.save({ session });

  return booking;
};

/**
 * refundEscrow — Partially or fully refund customer on cancellation
 * @param {string} bookingId
 * @param {number} refundPercent — 0, 50, or 100
 * @param {object} session
 */
export const refundEscrow = async (bookingId, refundPercent, session = null) => {
  const booking = await Booking.findById(bookingId).session(session);
  if (!booking) throw new Error('Booking not found for escrow refund');

  const refundAmount = Math.round((booking.totalAmount * refundPercent) / 100);

  if (refundAmount > 0) {
    await creditWallet(
      booking.customerId,
      refundAmount,
      `Cancellation refund (${refundPercent}%) for booking #${booking._id}`,
      { bookingId: booking._id, type: TRANSACTION_TYPES.REFUND },
      session
    );
  }

  // If provider was partially compensated (50% of basePrice)
  if (refundPercent < 100) {
    const providerCompensation = Math.round(booking.basePrice * (100 - refundPercent) / 100);
    if (providerCompensation > 0) {
      await creditWallet(
        booking.providerId,
        providerCompensation,
        `Cancellation compensation for booking #${booking._id}`,
        { bookingId: booking._id, type: TRANSACTION_TYPES.CREDIT },
        session
      );
    }
  }

  booking.escrowStatus = ESCROW_STATUS.REFUNDED;
  await booking.save({ session });

  return { booking, refundAmount };
};

export default { holdEscrow, releaseEscrow, refundEscrow };

