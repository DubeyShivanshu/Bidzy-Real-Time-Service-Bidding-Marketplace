/**
 * Wallet API Service
 *
 * Axios connectors to wallet endpoints:
 *  GET  /api/wallet               — getWallet (balance)
 *  GET  /api/wallet/transactions  — getTransactions (paginated)
 *  POST /api/wallet/create-order  — createOrder (Razorpay or mock)
 *  POST /api/wallet/verify-payment — verifyPayment
 */

import api from '../api.js';

export const getWallet = () =>
  api.get('/wallet');

export const getTransactions = (params = {}) =>
  api.get('/wallet/transactions', { params });

export const createOrder = (amount) =>
  api.post('/wallet/create-order', { amount });

export const verifyPayment = (payload) =>
  api.post('/wallet/verify-payment', payload);

export default { getWallet, getTransactions, createOrder, verifyPayment };
