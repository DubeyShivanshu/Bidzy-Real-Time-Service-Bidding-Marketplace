/**
 * Responsibilities:
 *  - Create and export a configured Razorpay instance
 *  - Falls back to null (mock mode) if credentials are not provided in .env
 *  - Used by wallet.controller.js for order creation and payment verification
 *
 * Mock Mode:
 * If RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET are empty/placeholder values, 
 *  razorpay will be null. Controllers must check for null before calling Razorpay APIs.
 */

import Razorpay from 'razorpay';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

const isValidKey = (key) => key && !key.startsWith('your_') && !key.startsWith('rzp_test_xxxx');

let razorpay = null;

if (isValidKey(keyId) && isValidKey(keySecret)) {
  razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  console.log('Razorpay initialized (Live Mode)');
} else {
  console.warn('Razorpay credentials not set — running in MOCK MODE. Payments will be simulated.');
}

export const isMockMode = !razorpay;
export default razorpay;
