/**
 * store/bids/bidStore.js — Bids Zustand Store
 *
 * Responsibilities:
 *  - Store bids for the currently viewed job
 *  - Actions:
 *    * setBids(bids) — load existing bids on join
 *    * addBid(bid) — prepend new bid from socket bid:new event
 *    * clearBids() — reset when leaving bidding room
 *
 * Shape:
 *  {
 *    bids: Bid[],
 *    bidCount: number,
 *    setBids, addBid, clearBids
 *  }
 */

import { create } from 'zustand';

const useBidStore = create((set) => ({
  bids: [],
  bidCount: 0,
  setBids: (bids) => set({ bids, bidCount: bids.length }),
  addBid: (bid) =>
    set((state) => {
      const exists = state.bids.some((b) => b._id === bid._id);
      if (exists) return state;
      const updatedBids = [...state.bids, bid].sort((a, b) => a.price - b.price);
      return { bids: updatedBids, bidCount: updatedBids.length };
    }),
  clearBids: () => set({ bids: [], bidCount: 0 }),
}));


export default useBidStore;
