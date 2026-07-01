/**
 * Provider Verification Request Model
 *
 * Responsibilities:
 *  - Stores document upload URLs for provider KYC verification
 *  - Admin reviews and approves/rejects
 *  - On approval: User.verified = true
 *  - One verification record per provider (upserted on re-submission)
 *
 * Indexes:
 *  - providerId (unique — one active verification per provider)
 *  - status — for admin filter queries
 */

import mongoose from 'mongoose';
import { VERIFICATION_STATUS } from '../config/constants.js';

const verificationSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    aadhaarUrl: {
      type: String,
      // Multer upload path or cloud storage URL
    },
    panUrl: {
      type: String,
    },
    otherDocs: [
      {
        label: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
    },
    adminNote: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Admin user ID
    },
  },
  { timestamps: true }
);

verificationSchema.index({ status: 1 });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;
