/**
 * components/wallet/TopUpModal.jsx — Razorpay Top-Up Modal
 *
 * Props: isOpen, onClose, onSuccess
 * Flow:
 *  1. User enters amount
 *  2. POST /wallet/create-order
 *  3. Open Razorpay checkout widget
 *  4. On payment success: POST /wallet/verify-payment
 *  5. Call onSuccess with new balance
 */
import React from 'react';
const TopUpModal = ({ isOpen, onClose, onSuccess }) => null;
export default TopUpModal;
