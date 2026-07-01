/**
 * Responsibilities:
 *  - REST-based chat loading stubs
 */

import { useState } from 'react';
import useChatStore from '@store/chat/chatStore.js';
import * as chatService from '@services/chat/chat.service.js';

export const useChat = (bookingId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { messages, setMessages } = useChatStore();

  const loadHistory = async () => {};

  return { messages, loadHistory, loading, error };
};

export default useChat;
