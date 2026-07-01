/**
 * Review Model
 *
 * Responsibilities:
 *  - Customer submits a review after booking completion
 *  - One review per booking (unique constraint)
 *  - Post-save hook recalculates provider's rating and totalReviews atomically
 *
 * Indexes:
 *  - bookingId (unique — one review per booking)
 *  - providerId — for fetching all reviews of a provider
 */

import mongoose from 'mongoose';
import { getIO } from '../config/socket.js';

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    feedback: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ providerId: 1 });

/**
 * Post-save hook — recalculate provider's average rating and totalReviews
 * Uses $avg aggregation over all reviews for this provider.
 * Imported lazily to avoid circular dependency with User model.
 */
reviewSchema.post('save', async function () {
  try {
    const Review = mongoose.model('Review');
    const User = mongoose.model('User');

    const [stats] = await Review.aggregate([
      { $match: { providerId: this.providerId } },
      {
        $group: {
          _id: '$providerId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats) {
      const updatedUser = await User.findByIdAndUpdate(this.providerId, {
        rating: Math.round(stats.avgRating * 10) / 10, // round to 1 decimal
        totalReviews: stats.count,
      }, { new: true });

      try {
        const io = getIO();
        if (io && updatedUser) {
          io.to(`user:${this.providerId.toString()}`).emit('user:rating_updated', {
            rating: updatedUser.rating,
            totalReviews: updatedUser.totalReviews
          });
        }
      } catch (socketErr) {
        console.warn('[Review] Socket emit failed:', socketErr.message);
      }
    }
  } catch (err) {
    console.error('[Review] Post-save rating recalc failed:', err.message);
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;

