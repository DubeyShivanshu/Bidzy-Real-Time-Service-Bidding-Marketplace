/**
 * components/bidding/CountdownTimer.jsx — Job Expiry Countdown
 *
 * Props: expiresAt (ISO date string)
 * Counts down to 0, then displays "Expired"
 * Shows HH:MM:SS format. Shows red warning when < 5 minutes remaining.
 */
import React, { useState, useEffect } from 'react';

export const CountdownTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const difference = new Date(expiresAt) - new Date();
      return difference > 0 ? Math.floor(difference / 1000) : 0;
    };

    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 300 && timeLeft > 0; // red when < 5 minutes

  if (timeLeft === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
        Expired
      </span>
    );
  }

  const timeDisplay = hours > 0
    ? `${hours}h ${minutes.toString().padStart(2, '0')}m`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${
        isUrgent
          ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
          : 'bg-green-50 border-green-200 text-green-700'
      }`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isUrgent ? 'bg-red-400' : 'bg-green-400'
          }`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isUrgent ? 'bg-red-500' : 'bg-green-500'
          }`}
        ></span>
      </span>
      <span>
        {isUrgent ? '⚠ ' : ''}Time Left: {timeDisplay}
      </span>
    </div>
  );
};

export default CountdownTimer;

