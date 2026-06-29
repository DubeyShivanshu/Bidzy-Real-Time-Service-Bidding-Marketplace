/**
 * components/chat/MessageBubble.jsx — Chat Message Bubble
 *
 * Props: message (ChatMessage), isOwn (boolean)
 * Shows sender name, message text, time, read receipt
 */
import React from 'react';

const MessageBubble = ({ message, isOwn }) => {
  const time = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className={`flex flex-col gap-0.5 ${isOwn ? 'items-end' : 'items-start'}`}>
      {/* Sender name — only shown for the other participant */}
      {!isOwn && message.senderName && (
        <span className="text-[10px] font-bold text-gray-400 px-1 uppercase tracking-wider">
          {message.senderName}
        </span>
      )}

      <div
        className={`
          relative max-w-[82%] px-4 py-2.5 text-sm leading-relaxed shadow-sm
          ${isOwn
            ? 'bg-green-600 text-white rounded-2xl rounded-tr-none'
            : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-tl-none'
          }
        `}
      >
        <p className="break-words whitespace-pre-wrap">{message.message}</p>
      </div>

      <span className="text-[9px] text-gray-400 font-semibold px-1">{time}</span>
    </div>
  );
};

export default MessageBubble;

