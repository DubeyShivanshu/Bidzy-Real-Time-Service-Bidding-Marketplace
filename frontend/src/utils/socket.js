/**
 * Socket.io Client Singleton
 *
 * Responsibilities:
 *  - Create a single Socket.io client instance
 *  - Connect to VITE_SOCKET_URL with JWT auth header
 *  - Export singleton for use across components and feature hooks
 *  - getSocket() — return the singleton instance
 *  - connectSocket(token) — connect with auth
 *  - disconnectSocket() — cleanup on logout
 */

import { io } from 'socket.io-client';

let socket = null;

/**
 * connectSocket — initialize socket connection with JWT
 * @param {string} token
 */
export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  socket = io(socketUrl, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
  });
  return socket;
};

/**
 * getSocket — return existing socket instance
 */
export const getSocket = () => socket;

/**
 * disconnectSocket — close connection and clear reference
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default { connectSocket, getSocket, disconnectSocket };
