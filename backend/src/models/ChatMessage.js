/**
 * Chat Message Model
 *
 * Responsibilities:
 *  - Stores persistent chat messages for a booking's chat room
 *  - Room ID format: chat_<bookingId>
 *  - Tracks read status for read receipts feature
 *  - Used by admin for dispute investigation (read-only view)
 *
 * Indexes:
 *  - bookingId + createdAt — for efficient message history queries
 *  - roomId
 */

import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    roomId: {
      // chat_<bookingId>
      type: String,
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    senderRole: {
      // 'customer' | 'provider'
      type: String,
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

chatMessageSchema.index({ bookingId: 1, createdAt: 1 });
chatMessageSchema.index({ roomId: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage;
