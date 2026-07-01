/**
 * Live Bid List with Socket Updates
 *
 * Props: jobId, isCustomer
 * Reads from bidStore — updated in real-time via bid:new socket events
 */
import React, { useEffect } from 'react';
import useBids from '../../features/bids/useBids.js';
import BidCard from './BidCard.jsx';
import Spinner from '../common/Spinner.jsx';

export const BidList = ({ jobId, isCustomer }) => {
  const { bids, fetchBids, acceptProviderBid, rejectProviderBid, loading } = useBids(jobId);

  useEffect(() => {
    fetchBids();
  }, [jobId]);

  if (loading && bids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-gray-500 font-medium">Loading live bids...</p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
        <div className="inline-flex items-center justify-center p-3 bg-green-50 rounded-full text-green-600 mb-3">
          <svg className="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-900">Waiting for bids...</p>
        <p className="text-xs text-gray-500 mt-1">Nearby service providers will start bidding on your job shortly.</p>
      </div>
    );
  }

  const handleAccept = async (bidId) => {
    try {
      await acceptProviderBid(bidId);
    } catch (err) {
      // Handled by hook error/toast
    }
  };

  const handleReject = async (bidId) => {
    await rejectProviderBid(bidId);
  };

  return (
    <div className="space-y-4">
      {bids.map((bid) => (
        <BidCard
          key={bid._id}
          bid={bid}
          onAccept={handleAccept}
          onReject={handleReject}
          isCustomer={isCustomer}
        />
      ))}
    </div>
  );
};

export default BidList;

