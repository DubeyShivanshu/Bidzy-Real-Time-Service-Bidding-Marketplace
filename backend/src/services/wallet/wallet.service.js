/**
 * Wallet Service
 *
 * Responsibilities:
 *  - creditWallet(userId, amount, description, metadata) — Add funds + create Transaction
 *  - debitWallet(userId, amount, description, metadata) — Deduct funds + create Transaction
 *  - getBalance(userId) — Return current wallet balance
 *  - createTransaction(data) — Create Transaction record with running balance
 *
 * Note: All wallet mutations use $inc for atomic updates (safe for concurrent operations).
 */

import User from '../../models/User.js';
import Transaction from '../../models/Transaction.js';
import { TRANSACTION_TYPES } from '../../config/constants.js';

/**
 * creditWallet — Add funds to user's wallet and log the transaction
 * @param {string} userId
 * @param {number} amount
 * @param {string} description
 * @param {object} metadata — { bookingId?, paymentId?, type? }
 * @param {object} session — Optional MongoDB session for atomicity
 */
export const creditWallet = async (userId, amount, description, metadata = {}, session = null) => {
  const opts = session ? { session } : {};

  // Atomically increment wallet balance
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: amount } },
    { new: true, ...opts }
  );

  if (!user) throw new Error(`User ${userId} not found for wallet credit`);

  // Create immutable ledger entry
  const [transaction] = await Transaction.create(
    [
      {
        userId,
        type: metadata.type || TRANSACTION_TYPES.CREDIT,
        amount,
        balance: user.walletBalance,
        description,
        bookingId: metadata.bookingId || null,
        paymentId: metadata.paymentId || null,
      },
    ],
    opts
  );

  return { user, transaction };
};

/**
 * debitWallet — Deduct funds from user's wallet and log the transaction
 * @param {string} userId
 * @param {number} amount
 * @param {string} description
 * @param {object} metadata — { bookingId?, type? }
 * @param {object} session — Optional MongoDB session for atomicity
 */
export const debitWallet = async (userId, amount, description, metadata = {}, session = null) => {
  const opts = session ? { session } : {};

  // Fetch current balance first to validate
  const userBefore = await User.findById(userId).session(session || null);
  if (!userBefore) throw new Error(`User ${userId} not found for wallet debit`);
  if (userBefore.walletBalance < amount) {
    const err = new Error('Insufficient wallet balance');
    err.statusCode = 400;
    err.code = 'INSUFFICIENT_BALANCE';
    throw err;
  }

  // Atomically decrement
  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { walletBalance: -amount } },
    { new: true, ...opts }
  );

  const [transaction] = await Transaction.create(
    [
      {
        userId,
        type: metadata.type || TRANSACTION_TYPES.DEBIT,
        amount,
        balance: user.walletBalance,
        description,
        bookingId: metadata.bookingId || null,
        paymentId: metadata.paymentId || null,
      },
    ],
    opts
  );

  return { user, transaction };
};

/**
 * getBalance — Fetch user's current wallet balance
 */
export const getBalance = async (userId) => {
  const user = await User.findById(userId).select('walletBalance');
  if (!user) throw new Error(`User ${userId} not found`);
  return user.walletBalance;
};

/**
 * createTransaction — Manually create a Transaction document
 * Used when balance is managed outside of credit/debit helpers.
 */
export const createTransaction = async (data, session = null) => {
  const opts = session ? { session } : {};
  const [transaction] = await Transaction.create([data], opts);
  return transaction;
};

export default { creditWallet, debitWallet, getBalance, createTransaction };

