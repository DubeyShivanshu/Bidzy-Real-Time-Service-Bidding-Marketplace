/**
 * store/bookings/bookingStore.js — Booking Zustand Store
 *
 * State:
 *  - bookings: Booking[]
 *  - currentBooking: Booking | null
 *  - pagination: { page, limit, total, pages }
 *
 * Actions:
 *  - setBookings, setCurrentBooking, clearCurrentBooking
 *  - updateBookingStatus (for real-time status updates from socket events)
 */

import { create } from 'zustand';

const useBookingStore = create((set, get) => ({
  bookings: [],
  currentBooking: null,
  pagination: { page: 1, limit: 10, total: 0, pages: 0 },
  loading: false,
  error: null,

  setBookings: (bookings, pagination = {}) =>
    set({ bookings, pagination: { ...get().pagination, ...pagination } }),

  setCurrentBooking: (booking) => set({ currentBooking: booking }),

  clearCurrentBooking: () => set({ currentBooking: null }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  updateBookingStatus: (bookingId, status) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b._id === bookingId ? { ...b, status } : b
      ),
      currentBooking:
        state.currentBooking?._id === bookingId
          ? { ...state.currentBooking, status }
          : state.currentBooking,
    })),

  clearBookings: () => set({ bookings: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }),
}));

export default useBookingStore;
