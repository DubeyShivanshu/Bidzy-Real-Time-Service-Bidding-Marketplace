/**
 * models/Booking.js — Booking Model
 *
 * Responsibilities:
 *  - Created when a customer accepts a bid
 *  - Stores full payment breakdown (base, deposit, fee, total)
 *  - Tracks escrow status separately from booking status
 *  - Referenced by ChatMessage, Review, Dispute, Transaction
 *
 * Payment Calculation:
 *  securityDeposit = basePrice * SECURITY_DEPOSIT_PERCENT / 100
 *  platformFee     = basePrice * PLATFORM_FEE_PERCENT / 100
 *  totalAmount     = basePrice + securityDeposit + platformFee
 *
 * Escrow Flow:
 *  On booking: debit totalAmount from customer wallet → hold in escrow
 *  On complete: credit basePrice to provider, credit securityDeposit back to customer
 *  On cancel: apply refund policy (0/50/100%) based on time elapsed
 */

import mongoose from 'mongoose';
import { BOOKING_STATUS, ESCROW_STATUS } from '../config/constants.js';

const bookingSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    bidId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    securityDeposit: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.ACTIVE,
    },
    escrowStatus: {
      type: String,
      enum: Object.values(ESCROW_STATUS),
      default: ESCROW_STATUS.HELD,
    },
    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

bookingSchema.index({ customerId: 1 });
bookingSchema.index({ providerId: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
