/**
 * Booking API Service
 *
 * Axios connectors to booking endpoints:
 *  GET  /api/bookings/customer/my    — getCustomerBookings
 *  GET  /api/bookings/provider/my    — getProviderBookings
 *  GET  /api/bookings/:id            — getBookingById
 *  PATCH /api/bookings/:id/complete  — completeBooking
 *  PATCH /api/bookings/:id/cancel    — cancelBooking
 */

import api from '../api.js';

export const getCustomerBookings = (params = {}) =>
  api.get('/bookings/customer/my', { params });

export const getProviderBookings = (params = {}) =>
  api.get('/bookings/provider/my', { params });

export const getBookingById = (bookingId) =>
  api.get(`/bookings/${bookingId}`);

export const completeBooking = (bookingId) =>
  api.patch(`/bookings/${bookingId}/complete`);

export const cancelBooking = (bookingId) =>
  api.patch(`/bookings/${bookingId}/cancel`);

export default {
  getCustomerBookings,
  getProviderBookings,
  getBookingById,
  completeBooking,
  cancelBooking,
};
