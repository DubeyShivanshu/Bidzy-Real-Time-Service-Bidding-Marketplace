/**
 * Responsibilities:
 *  - Create Socket.io server attached to Node HTTP server
 *  - Configure CORS for Socket.io
 *  - Export io instance for use in socket handlers and controllers
 *  - Register bidding and chat socket namespaces
 */

import { Server } from 'socket.io';
import { handleBiddingSocket } from '../sockets/bidding.socket.js';
import { handleChatSocket } from '../sockets/chat.socket.js';
import jwt from 'jsonwebtoken';

let io = null;

/**
 * initSocket — called once from server.js with the HTTP server instance
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server}
 */
export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bidzy_jwt_secret');
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.id})`);
    
    // Auto-join personal user room for targeted notifications
    socket.join(`user:${socket.user.id}`);
    
    // Auto-join admin room for global platform notifications (like commission updates)
    if (socket.user.role === 'admin') {
      socket.join('admin');
    }

    // Register event handlers
    handleBiddingSocket(socket, io);
    handleChatSocket(socket, io);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};


/**
 * getIO — retrieve the singleton Socket.io instance
 * Used in controllers to emit events server-side
 */
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export default { initSocket, getIO };
