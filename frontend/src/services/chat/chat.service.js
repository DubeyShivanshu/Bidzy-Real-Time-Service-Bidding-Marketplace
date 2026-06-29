/**
 * services/chat/chat.service.js — Chat API Calls
 *
 * Responsibilities:
 *  - getChatHistory(bookingId) → GET /chat/:bookingId/history
 *
 * Note: Real-time messaging uses Socket.io (utils/socket.js).
 * This service is only for loading initial message history.
 */

import api from '../api.js';

export const getChatHistory = (bookingId) => api.get(`/chat/${bookingId}/history`);
