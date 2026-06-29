/**
 * store/chat/chatStore.js — Chat Zustand Store
 *
 * Responsibilities:
 *  - Store messages for active chat room
 *  - Track typing status of other participant
 *  - Track online status of participants
 */

import { create } from 'zustand';

const useChatStore = create((set) => ({
  messages: [],
  typingUsers: {},
  onlineUsers: [],

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => {
      // Avoid duplicate messages in UI
      const exists = state.messages.some((msg) => msg._id === message._id);
      if (exists) return state;
      return { messages: [...state.messages, message] };
    }),

  setTyping: (userId, isTyping) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [userId]: isTyping,
      },
    })),

  setOnline: (users) => set({ onlineUsers: users }),

  clearChat: () => set({ messages: [], typingUsers: {}, onlineUsers: [] }),
}));

export default useChatStore;
