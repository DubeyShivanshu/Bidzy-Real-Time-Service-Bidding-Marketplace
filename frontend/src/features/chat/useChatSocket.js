/**
 * features/chat/useChatSocket.js
 *
 * Responsibilities:
 *  - Socket connection for booking live chat
 *  - Emit typing indicator and message send
 */

import { useEffect } from 'react';
import useChatStore from '@store/chat/chatStore.js';
import useSocket from '@hooks/useSocket.js';

export const useChatSocket = (bookingId) => {
  const socket = useSocket();
  const { addMessage, setTyping, setOnline, clearChat } = useChatStore();

  const sendMessage = (text) => {};
  const emitTyping = (isTyping) => {};

  return { sendMessage, emitTyping };
};

export default useChatSocket;
