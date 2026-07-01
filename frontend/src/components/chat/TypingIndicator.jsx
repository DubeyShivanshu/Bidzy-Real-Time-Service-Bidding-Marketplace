/**
 * "X is typing..." Indicator
 *
 * Props: name
 * Animated 3-dot indicator shown when other participant is typing
 */
import React from 'react';

const TypingIndicator = ({ name }) => {
  return (
    <div className="flex items-center gap-2 px-1">
      {/* Animated bubbles */}
      <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl rounded-tl-none px-3 py-2 shadow-sm">
        <span
          className="block w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1s' }}
        />
        <span
          className="block w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: '180ms', animationDuration: '1s' }}
        />
        <span
          className="block w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
          style={{ animationDelay: '360ms', animationDuration: '1s' }}
        />
      </div>
      {name && (
        <span className="text-[10px] text-gray-400 font-semibold italic">
          {name} is typing…
        </span>
      )}
    </div>
  );
};

export default TypingIndicator;

