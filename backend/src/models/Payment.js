/**
 * models/Payment.js — Razorpay Payment Record Model
 *
 * Responsibilities:
 *  - Records every Razorpay payment attempt for wallet top-up
 *  - Stores orderId and paymentId for signature verification
 *  - Status updated after webhook confirmation
 *  - Used for admin analytics (total top-ups, revenue)
 *
 * Indexes:
 *  - orderId (unique)
 *  - userId
 */

import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      // Razorpay order ID (rzp_order_xxx)
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      // Razorpay payment ID (rzp_pay_xxx) — set after capture
      type: String,
    },
    amount: {
      // Amount in paise (INR × 100)
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    gateway: {
      type: String,
      default: 'razorpay',
    },
    signature: {
      // Razorpay payment signature (stored for audit)
      type: String,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
