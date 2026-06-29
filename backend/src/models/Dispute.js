import mongoose from 'mongoose';
import { DISPUTE_STATUS } from '../config/constants.js';

const disputeSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    raisedByRole: {
      type: String,
      enum: ['customer', 'provider'],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(DISPUTE_STATUS),
      default: DISPUTE_STATUS.OPEN,
    },
    resolution: {
      type: String,
      trim: true,
    },
    refundIssued: {
      type: Boolean,
      default: false,
    },
    refundAmount: {
      type: Number,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin user ID
    },
  },
  { timestamps: true }
);

disputeSchema.index({ status: 1 });
disputeSchema.index({ raisedBy: 1 });

const Dispute = mongoose.model('Dispute', disputeSchema);

export default Dispute;
