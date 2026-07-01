/**
 * Review Controller
 *
 * Responsibilities:
 *  - submitReview: Validate booking is complete + customer owns it + no duplicate → create Review
 *  - getProviderReviews: Return paginated reviews for a provider (public)
 *  - getBookingReview: Return the review for a specific booking (auth required)
 */

import Review from '../../models/Review.js';
import Booking from '../../models/Booking.js';
import { BOOKING_STATUS } from '../../config/constants.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';

/**
 * POST /api/reviews
 * Submit a review for a completed booking. Customer only, one review per booking.
 */
export const submitReview = async (req, res, next) => {
  try {
    const { bookingId, rating, feedback } = req.body;

    if (!bookingId || !rating) {
      return errorResponse(res, 'bookingId and rating are required', 400);
    }

    const parsedRating = Number(rating);
    if (parsedRating < 1 || parsedRating > 5) {
      return errorResponse(res, 'Rating must be between 1 and 5', 400);
    }

    // Verify booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) return errorResponse(res, 'Booking not found', 404);

    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      return errorResponse(res, 'Reviews can only be submitted for completed bookings', 400);
    }

    // Only the customer who owns the booking can review
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'You are not authorized to review this booking', 403);
    }

    // Check for duplicate (unique index on bookingId handles DB-level, but give friendly error)
    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return errorResponse(res, 'You have already submitted a review for this booking', 400);
    }

    const review = await Review.create({
      bookingId,
      customerId: req.user._id,
      providerId: booking.providerId,
      rating: parsedRating,
      feedback: feedback?.trim() || '',
    });

    return successResponse(res, review, 'Review submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/provider/:providerId
 * Public — paginated reviews for a provider, newest first, with customer name.
 */
export const getProviderReviews = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ providerId })
        .populate('customerId', 'name city')
        .populate('bookingId', 'jobId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ providerId }),
    ]);

    return paginatedResponse(res, reviews, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/reviews/booking/:bookingId
 * Auth — return the review for a specific booking (if it exists).
 */
export const getBookingReview = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const review = await Review.findOne({ bookingId })
      .populate('customerId', 'name city')
      .populate('providerId', 'name speciality rating');

    if (!review) {
      return errorResponse(res, 'No review found for this booking', 404);
    }

    return successResponse(res, review, 'Review fetched successfully');
  } catch (error) {
    next(error);
  }
};

