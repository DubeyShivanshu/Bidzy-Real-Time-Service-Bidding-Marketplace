/**
 * Message Composition Input
 *
 * Props: bookingId, userId, disabled
 * - Text input with send button
 * - Emits chat:typing via socket (debounced)
 * - Emits chat:message via socket on send (Enter key or button click)
 * - Shift+Enter inserts newline
 */
import React, { useState, useRef, useCallback } from 'react';
import { Send } from 'lucide-react';
import { getSocket } from '@utils/socket.js';
import useAuthStore from '@store/auth/authStore.js';

const ChatInput = ({ bookingId, disabled = false }) => {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);
  const { user } = useAuthStore();

  const emitTyping = useCallback(
    (isTyping) => {
      const socket = getSocket();
      if (!socket || !bookingId || !user?._id) return;
      socket.emit('chat:typing', { bookingId, userId: user._id, isTyping });
    },
    [bookingId, user]
  );

  const sendMessage = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit('chat:message', {
      bookingId,
      senderId: user._id,
      senderRole: user.role,
      senderName: user.name,
      message: trimmed,
    });

    // Clear typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTyping(false);
    setText('');
  }, [text, disabled, bookingId, user, emitTyping]);

  const handleChange = (e) => {
    setText(e.target.value);

    // Debounced typing indicator
    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTyping(false), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
      className="flex items-end gap-2 p-4 border-t border-gray-200 bg-white rounded-b-2xl"
    >
      <textarea
        id="chat-message-input"
        rows={1}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={disabled ? 'Chat is closed for this booking' : 'Type a message…'}
        className={`
          flex-grow resize-none px-4 py-2.5 border border-gray-200 rounded-xl text-sm
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
          transition leading-relaxed max-h-24
          ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900'}
        `}
        style={{ minHeight: '44px' }}
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        id="chat-send-btn"
        className="
          flex-shrink-0 p-2.5 bg-green-600 hover:bg-green-700
          text-white rounded-xl transition shadow-sm
          disabled:opacity-40 disabled:cursor-not-allowed
          active:scale-95
        "
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
};

export default ChatInput;

