/**
 * Full Chat Interface
 *
 * Props:
 *   bookingId     {string}  — the booking this chat belongs to
 *   counterparty  {string}  — display name of the other participant
 *   disabled      {boolean} — true when booking is completed/cancelled
 *
 * Responsibilities:
 *  - Join socket room chat_<bookingId> on mount, leave on unmount
 *  - Load history via GET /chat/:bookingId/history
 *  - Render MessageBubble list (own vs. other)
 *  - Render TypingIndicator when other user is typing
 *  - Auto-scroll to bottom on new message
 *  - Render ChatInput for composing messages
 */
import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, WifiOff } from 'lucide-react';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import Spinner from '@components/common/Spinner.jsx';
import useChatStore from '@store/chat/chatStore.js';
import useAuthStore from '@store/auth/authStore.js';
import { getSocket, connectSocket } from '@utils/socket.js';
import { getChatHistory } from '../../services/chat/chat.service.js';

const ChatWindow = ({ bookingId, counterparty = 'Other party', disabled = false }) => {
  const { user } = useAuthStore();
  const { messages, typingUsers, setMessages, addMessage, setTyping, clearChat } = useChatStore();
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [socketError, setSocketError] = useState(false);

  // Combined socket + history setup on bookingId change 
  useEffect(() => {
    if (!bookingId) return;

    // Clear previous chat messages immediately
    clearChat();
    setLoading(true);

    // Try to get existing socket, or reconnect with stored token
    let socket = getSocket();
    if (!socket || !socket.connected) {
      const { token } = useAuthStore.getState();
      if (token) socket = connectSocket(token);
    }

    if (!socket) {
      setSocketError(true);
      setLoading(false);
      return;
    }
    setSocketError(false);

    // Join the chat room
    socket.emit('chat:join', { bookingId });

    // Wire up event handlers
    const handleMessage = (newMsg) => addMessage(newMsg);
    const handleTyping = ({ userId: uid, isTyping }) => {
      const myId = useAuthStore.getState().user?._id?.toString();
      if (uid?.toString() !== myId) setTyping(uid, isTyping);
    };
    socket.on('chat:message', handleMessage);
    socket.on('chat:typing', handleTyping);

    // Load history from REST (after joining room so no messages are missed)
    getChatHistory(bookingId)
      .then((res) => setMessages(res.data?.data || []))
      .catch((err) => console.error('[ChatWindow] History load failed:', err))
      .finally(() => setLoading(false));

    return () => {
      socket.emit('chat:leave', { bookingId });
      socket.off('chat:message', handleMessage);
      socket.off('chat:typing', handleTyping);
    };
  }, [bookingId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom when messages change 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Is anyone other than me typing?
  const myId = user?._id?.toString();
  const isOtherTyping = Object.entries(typingUsers).some(
    ([uid, isTyping]) => uid.toString() !== myId && isTyping
  );

  return (
    <div
      id={`chat-window-${bookingId}`}
      className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="p-2 bg-green-50 rounded-xl">
          <MessageSquare className="h-4 w-4 text-green-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{counterparty}</p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
            {disabled ? 'Chat closed' : 'Active chat'}
          </p>
        </div>
        {socketError && (
          <div className="ml-auto flex items-center gap-1 text-red-500">
            <WifiOff className="h-3.5 w-3.5" />
            <span className="text-[10px] font-bold">Offline</span>
          </div>
        )}
      </div>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/40">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <MessageSquare className="h-8 w-8 text-gray-200" />
            <p className="text-xs font-semibold text-gray-400">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              // MongoDB returns senderId as string from JSON; compare as strings
              const isOwn = msg.senderId?.toString() === myId;
              return (
                <MessageBubble
                  key={msg._id || `${msg.senderId}-${msg.createdAt}`}
                  message={msg}
                  isOwn={isOwn}
                />
              );
            })}
          </>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Typing Indicator ── */}
      {isOtherTyping && (
        <div className="px-5 py-2 bg-gray-50/40 border-t border-gray-100 flex-shrink-0">
          <TypingIndicator name={counterparty} />
        </div>
      )}

      {/* ── Chat Input ── */}
      <div className="flex-shrink-0">
        <ChatInput bookingId={bookingId} disabled={disabled} />
      </div>
    </div>
  );
};

export default ChatWindow;

