/**
 * hooks/useSocket.js — Socket.io Connection Hook
 *
 * Responsibilities:
 *  - Connect socket on mount (if authenticated)
 *  - Disconnect on unmount
 *  - Return socket instance for event registration
 *  - Read token from authStore for auth
 *
 * Usage:
 *  const socket = useSocket();
 *  socket.on('bid:new', handleNewBid);
 */

import { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@utils/socket.js';
import useAuthStore from '@store/auth/authStore.js';

const useSocket = () => {
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
    return () => {
      // Note: Don't disconnect on every unmount — managed by logout action
    };
  }, [token]);

  return getSocket();
};

export default useSocket;
