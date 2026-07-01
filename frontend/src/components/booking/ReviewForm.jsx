/**
 * Star Rating + Feedback Form
 *
 * Props:
 *   bookingId   {string}   — booking being reviewed
 *   providerId  {string}   — shown in header for context
 *   providerName {string}  — shown in header
 *   onSubmitted  {fn}      — called with the new review object after success
 *
 * Renders:
 *   - Interactive 5-star selector with hover animation
 *   - Optional text feedback textarea
 *   - Submit button with loading state
 *   - Read-only "already reviewed" state if review exists
 */
import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as reviewService from '../../services/reviews/review.service.js';

// Star Rating Selector 
const StarSelector = ({ value, onChange, disabled }) => {
  const [hovered, setHovered] = useState(0);

  const labels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => !disabled && setHovered(0)}
            className="p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hovered || value)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <span className="text-xs font-bold text-amber-600 tracking-wide">
          {labels[hovered || value]}
        </span>
      )}
    </div>
  );
};

// Static Star Display
export const StarDisplay = ({ rating, size = 'sm' }) => {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-6 w-6' };
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${
            star <= Math.round(rating)
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  );
};

// Main ReviewForm Component
const ReviewForm = ({ bookingId, providerName = 'the provider', onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [checking, setChecking] = useState(true);

  // Check if review already exists for this booking
  useEffect(() => {
    if (!bookingId) return;
    reviewService.getBookingReview(bookingId)
      .then((res) => setExistingReview(res.data.data))
      .catch(() => setExistingReview(null))
      .finally(() => setChecking(false));
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewService.submitReview({ bookingId, rating, feedback });
      const newReview = res.data.data;
      setExistingReview(newReview);
      toast.success('Review submitted! Thank you. ⭐');
      onSubmitted?.(newReview);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // Already reviewed — show read-only summary
  if (existingReview) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm font-bold text-amber-800">You reviewed this booking</p>
        </div>
        <StarDisplay rating={existingReview.rating} size="md" />
        {existingReview.feedback && (
          <p className="text-sm text-amber-900 italic leading-relaxed">
            "{existingReview.feedback}"
          </p>
        )}
        <p className="text-xs text-amber-600 font-semibold">
          {new Date(existingReview.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
      </div>
    );
  }

  // Review form
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5"
    >
      {/* Header */}
      <div>
        <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
          Rate your experience
        </h3>
        <p className="text-xs text-gray-400 mt-0.5 font-medium">
          How was your service with <span className="text-gray-700 font-bold">{providerName}</span>?
        </p>
      </div>

      {/* Star selector */}
      <StarSelector value={rating} onChange={setRating} disabled={submitting} />

      {/* Feedback textarea */}
      <div>
        <label htmlFor="review-feedback" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
          Write a review <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="review-feedback"
          rows={3}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={submitting}
          maxLength={500}
          placeholder="Share what went well, or any feedback for the provider..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 resize-none transition placeholder:text-gray-300 disabled:bg-gray-50"
        />
        <p className="text-right text-[10px] text-gray-300 mt-0.5">{feedback.length}/500</p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={rating === 0 || submitting}
        id="submit-review-btn"
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Star className="h-4 w-4 fill-white" />
            Submit Review
          </>
        )}
      </button>
    </form>
  );
};

export default ReviewForm;
