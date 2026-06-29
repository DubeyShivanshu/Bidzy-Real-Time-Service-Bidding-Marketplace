/**
 * services/notifications/notification.service.js — Notification Service
 *
 * Responsibilities:
 *  - sendSocketNotification(io, userId, event, data) — Emit targeted socket notification
 *  - Utility for sending in-app notifications to specific users via Socket.io
 *
 * Note: This is a placeholder for future extensibility.
 * Email/SMS notifications can be integrated here in later phases.
 */

/**
 * sendSocketNotification — emit event to a specific user's socket room
 * @param {import('socket.io').Server} io
 * @param {string} userId
 * @param {string} event
 * @param {object} data
 */
export const sendSocketNotification = (io, userId, event, data) => {
  // TODO: io.to(`user_${userId}`).emit(event, data)
};

export default { sendSocketNotification };
