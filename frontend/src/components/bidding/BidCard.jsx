/**
 * Individual Bid Display Card
 *
 * Props: bid (Bid object with providerSnapshot), onAccept, onReject, isCustomer
 * Shows: provider avatar, name, rating, price, message, eta, accept/reject buttons
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCircle, Clock, Check, X } from 'lucide-react';

export const BidCard = ({ bid, onAccept, onReject, isCustomer }) => {
  const { providerSnapshot, price, message, eta, status } = bid;
  const { name, rating, totalReviews, speciality, verified } = providerSnapshot || {};

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition duration-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          {isCustomer && bid.providerId ? (
            <Link 
              to={`/customer/providers/${typeof bid.providerId === 'object' ? bid.providerId._id : bid.providerId}`}
              className="text-lg font-bold text-gray-900 hover:text-green-600 transition"
            >
              {name || 'Service Provider'}
            </Link>
          ) : (
            <h4 className="text-lg font-bold text-gray-900">{name || 'Service Provider'}</h4>
          )}
          {verified && <CheckCircle className="h-5 w-5 text-green-500 fill-green-50" />}
          {speciality && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 capitalize">
              {speciality}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-600">
          <div className="flex items-center text-amber-500">
            <Star className="h-4 w-4 fill-amber-500" />
            <span className="font-semibold ml-1">{rating ? rating.toFixed(1) : '5.0'}</span>
          </div>
          <span>•</span>
          <span>{totalReviews || 0} reviews</span>
        </div>

        {message && <p className="mt-2.5 text-sm text-gray-600 italic bg-gray-50 p-2 rounded-md border border-gray-100">"{message}"</p>}

        {eta && (
          <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Estimated Arrival: {eta} mins</span>
          </div>
        )}
      </div>

      <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 gap-4">
        <div className="text-left md:text-right">
          <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Bid Amount</p>
          <p className="text-2xl font-black text-green-600">₹{price}</p>
          {isCustomer && status === 'pending' && (
            <div className="mt-1 text-[10px] text-gray-400 font-medium leading-tight">
              <div>Total Hold: <span className="font-bold text-gray-700">₹{Math.round(price * 1.15)}</span></div>
              <div>(Includes 10% deposit + 5% fee)</div>
            </div>
          )}
        </div>

        {isCustomer && status === 'pending' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReject && onReject(bid._id)}
              className="p-2 border border-gray-300 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition duration-150"
              title="Reject Bid"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={() => onAccept && onAccept(bid._id)}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition duration-150 shadow-sm"
              title="Accept Bid"
            >
              <Check className="h-4 w-4" />
              <span>Accept</span>
            </button>
          </div>
        )}

        {status !== 'pending' && (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              status === 'accepted'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}
          >
            {status}
          </span>
        )}
      </div>
    </div>
  );
};

export default BidCard;

