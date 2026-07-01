/**
 * Job Model
 *
 * Responsibilities:
 *  - Represents a service job posted by a customer
 *  - Stores GeoJSON location for 2dsphere geo-queries (nearby provider feeds)
 *  - Tracks expiry time for auto-close after 10 minutes
 *  - Referenced by Bid and Booking models
 *
 * Indexes:
 *  - location: '2dsphere' — enables $near queries for provider job feed
 *  - customerId
 *  - status
 *  - expiresAt (TTL-like, managed by cron/service)
 */

import mongoose from 'mongoose';
import { JOB_STATUS } from '../config/constants.js';

const jobSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      // Category
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    urgency: {
      // "immediate", "today", "scheduled"
      type: String,
      enum: ['immediate', 'today', 'scheduled'],
      default: 'today',
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    scheduledDate: {
      // For scheduled urgency jobs — customer-specified date/time
      type: Date,
    },
    address: {
      full: String,
      city: String,
      state: String,
      pincode: String,
    },
    location: {
      // GeoJSON Point — [longitude, latitude]
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.OPEN,
    },
    bidCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// 2dsphere index for geospatial queries
jobSchema.index({ location: '2dsphere' });
jobSchema.index({ customerId: 1 });
jobSchema.index({ status: 1 });

// Pre-save hook — only set expiresAt when the document is first created
jobSchema.pre('save', function (next) {
  if (this.isNew) {
    this.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  }
  next();
});

const Job = mongoose.model('Job', jobSchema);

export default Job;

