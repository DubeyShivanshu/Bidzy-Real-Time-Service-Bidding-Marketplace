/**
 * Bid Model
 *
 * Responsibilities:
 *  - Represents a provider's bid on a customer job
 *  - Stores a snapshot of provider details at time of bidding
 *    (avoids stale data if provider updates profile later)
 *  - Referenced by Booking on bid acceptance
 *
 * Indexes:
 *  - jobId + providerId (compound unique — one bid per provider per job)
 *  - jobId
 *  - providerId
 */

import mongoose from 'mongoose';
import { BID_STATUS } from '../config/constants.js';

const bidSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Snapshot of provider at time of bid submission
    providerSnapshot: {
      name: String,
      rating: Number,
      totalReviews: Number,
      speciality: String,
      city: String,
      verified: Boolean,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    message: {
      type: String,
      trim: true,
    },
    eta: {
      // Estimated arrival time in minutes
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(BID_STATUS),
      default: BID_STATUS.PENDING,
    },
  },
  { timestamps: true }
);

// One bid per provider per job
bidSchema.index({ jobId: 1, providerId: 1 }, { unique: true });
bidSchema.index({ jobId: 1 });
bidSchema.index({ providerId: 1 });

const Bid = mongoose.model('Bid', bidSchema);

export default Bid;
