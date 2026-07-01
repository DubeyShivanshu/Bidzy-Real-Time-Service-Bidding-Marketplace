/**
 * Single Review Display Card
 *
 * Props:
 *   review {object} — Review with populated customerId and optional bookingId
 *   showProviderName {boolean} — show provider name (for profile pages)
 *
 * Used on:
 *  - Provider public profile page
 *  - Provider dashboard (reviews received)
 */
import React from 'react';
import { Star, User } from 'lucide-react';
import { StarDisplay } from './ReviewForm.jsx';

const ReviewCard = ({ review, showProviderName = false }) => {
  const customer = review.customerId;
  const date = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '';

  // Initials for avatar
  const initials = customer?.name
    ? customer.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-3">
      {/* Top row — avatar, name, date */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar with initials */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-white">{initials}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">
              {customer?.name || 'Anonymous'}
            </p>
            {customer?.city && (
              <p className="text-[11px] text-gray-400 font-medium">{customer.city}</p>
            )}
          </div>
        </div>
        <p className="text-[10px] text-gray-400 font-semibold flex-shrink-0 mt-1">{date}</p>
      </div>

      {/* Star rating */}
      <StarDisplay rating={review.rating} size="sm" />

      {/* Feedback text */}
      {review.feedback && (
        <p className="text-sm text-gray-700 leading-relaxed italic">
          "{review.feedback}"
        </p>
      )}
    </div>
  );
};

export default ReviewCard;
