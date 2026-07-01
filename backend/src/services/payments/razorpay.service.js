/**
 * Razorpay Service
 *
 * Responsibilities:
 *  - createOrder(amount, currency, receipt) — Create Razorpay order (returns orderId)
 *  - verifySignature(orderId, paymentId, signature) — HMAC verification
 *  - fetchPayment(paymentId) — Fetch payment details from Razorpay API
 *
 * Note: Amount should be in paise (INR × 100) for all Razorpay calls.
 */

import razorpay, { isMockMode } from '../../config/razorpay.js';
import crypto from 'crypto';

/**
 * createOrder — Create a Razorpay payment order
 * @param {number} amount — Amount in paise (INR × 100)
 * @param {string} currency — Currency code (default: 'INR')
 * @param {string} receipt — Unique receipt ID (max 40 chars)
 * @returns {Promise<object>} Razorpay order object { id, amount, currency, receipt, status }
 */
export const createOrder = async (amount, currency = 'INR', receipt) => {
  if (isMockMode || !razorpay) {
    // Return a mock order object in dev/test mode
    return {
      id: `mock_order_${Date.now()}`,
      amount,
      currency,
      receipt: receipt || `mock_rcpt_${Date.now()}`,
      status: 'created',
      isMock: true,
    };
  }

  const order = await razorpay.orders.create({ amount, currency, receipt });
  return order;
};

/**
 * verifySignature — Verify Razorpay HMAC payment signature
 * @param {string} orderId — Razorpay order ID
 * @param {string} paymentId — Razorpay payment ID returned after checkout
 * @param {string} signature — Signature string from Razorpay callback
 * @returns {boolean} true if signature is valid
 */
export const verifySignature = (orderId, paymentId, signature) => {
  if (isMockMode) {
    // In mock mode all signatures are considered valid
    return true;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured');
  }

  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expected === signature;
};

/**
 * fetchPayment — Retrieve payment details from Razorpay API
 * @param {string} paymentId — Razorpay payment ID (e.g., pay_xxxxxxxxxx)
 * @returns {Promise<object>} Razorpay payment entity
 */
export const fetchPayment = async (paymentId) => {
  if (isMockMode || !razorpay) {
    // Return a minimal mock payment entity
    return {
      id: paymentId,
      status: 'captured',
      amount: 0,
      currency: 'INR',
      isMock: true,
    };
  }

  const payment = await razorpay.payments.fetch(paymentId);
  return payment;
};

export default { createOrder, verifySignature, fetchPayment };
