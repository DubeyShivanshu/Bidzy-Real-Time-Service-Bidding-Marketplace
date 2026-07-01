/**
 * Wallet Transaction Model
 *
 * Responsibilities:
 *  - Immutable ledger of all wallet movements for any user
 *  - Tracks running balance after each transaction
 *  - Types: credit, debit, refund, commission, deposit_return
 *  - Used for wallet history page and admin analytics
 *
 * Indexes:
 *  - userId + createdAt — for efficient transaction history queries
 *  - bookingId — for booking-level financial audit trail
 */

import mongoose from 'mongoose';
import { TRANSACTION_TYPES } from '../config/constants.js';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    balance: {
      // Wallet balance AFTER this transaction
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    paymentId: {
      // Razorpay payment ID (for top-up transactions)
      type: String,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ bookingId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
