/**
 * Real-Time Chat Socket Handler
 *
 * Responsibilities:
 *  - Handle all chat-related Socket.io events
 *  - Manage chat rooms: chat_<bookingId>
 *  - Persist messages to MongoDB via ChatMessage model
 *  - Emit message history on chat:join
 *  - Relay typing indicators
 *  - Track online status of participants
 *
 * Events handled:
 *  Client -> Server:
 *    chat:join    { bookingId }            — Join booking chat room + load history
 *    chat:leave   { bookingId }            — Leave booking chat room
 *    chat:message { bookingId, message }   — Send message (save + relay)
 *    chat:typing  { bookingId, isTyping }  — Typing indicator
 *
 *  Server -> Client:
 *    chat:history  messages[]              — Sent on chat:join
 *    chat:message  fullMessageObject       — Broadcast to chat_<bookingId>
 *    chat:typing   { userId, isTyping }    — Broadcast to room except sender
 */

import ChatMessage from '../models/ChatMessage.js';
import Booking from '../models/Booking.js';

/**
 * handleChatSocket — attach chat event handlers to a socket
 * @param {import('socket.io').Socket} socket
 * @param {import('socket.io').Server} io
 */
export const handleChatSocket = (socket, io) => {
  socket.on('chat:join', async ({ bookingId }) => {
    if (!bookingId) return;
    const roomName = `chat_${bookingId}`;
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined chat room: ${roomName}`);
  });

  socket.on('chat:leave', ({ bookingId }) => {
    if (!bookingId) return;
    const roomName = `chat_${bookingId}`;
    socket.leave(roomName);
    console.log(`Socket ${socket.id} left chat room: ${roomName}`);
  });

  socket.on('chat:message', async ({ bookingId, senderId, senderRole, senderName, message }) => {
    if (!bookingId || !senderId || !message || !message.trim()) return;

    try {
      const chatMsg = await ChatMessage.create({
        bookingId,
        roomId: `chat_${bookingId}`,
        senderId,
        senderRole,
        senderName,
        message: message.trim(),
      });

      // Broadcast message to everyone in the room
      io.to(`chat_${bookingId}`).emit('chat:message', chatMsg);
    } catch (err) {
      console.error('Error saving socket chat message:', err);
    }
  });

  socket.on('chat:typing', ({ bookingId, userId, isTyping }) => {
    if (!bookingId || !userId) return;
    // Broadcast typing indicator to other participants in the room
    socket.to(`chat_${bookingId}`).emit('chat:typing', { userId, isTyping });
  });
};

export default handleChatSocket;
