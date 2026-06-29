/**
 * components/bidding/LiveBidCounter.jsx — Animated Bid Count Badge
 *
 * Props: count
 * Animates when count changes (new bid received)
 */
import React, { useEffect, useState } from 'react';
import { Gavel } from 'lucide-react';

export const LiveBidCounter = ({ count }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (count > 0) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 500);
      return () => clearTimeout(timer);
    }
  }, [count]);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 border border-green-200 text-green-800 rounded-full text-sm font-semibold transition-all duration-300 ${
        pulse ? 'scale-110 shadow-md ring-2 ring-green-400' : ''
      }`}
    >
      <Gavel className={`h-4 w-4 ${pulse ? 'animate-bounce' : ''}`} />
      <span>{count} Bids Received</span>
    </div>
  );
};

export default LiveBidCounter;

