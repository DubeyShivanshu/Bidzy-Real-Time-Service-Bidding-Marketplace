/**
 * Wallet Controller
 *
 * Responsibilities:
 *  - getWallet: Return authenticated user's current wallet balance
 *  - getTransactions: Return paginated transaction history
 *  - createOrder: Create Razorpay order for top-up (or mock in dev)
 *  - verifyPayment: Verify HMAC signature → credit wallet → update Payment
 *  - handleWebhook: Process Razorpay webhook events with signature validation
 */

import crypto from 'crypto';
import User from '../../models/User.js';
import Transaction from '../../models/Transaction.js';
import Payment from '../../models/Payment.js';
import razorpay, { isMockMode } from '../../config/razorpay.js';
import { creditWallet } from '../../services/wallet/wallet.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import { PAYMENT_STATUS, TRANSACTION_TYPES } from '../../config/constants.js';

export const getWallet = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      // Platform revenue is stored in the primary admin's wallet
      const admins = await User.find({ role: 'admin' }).select('walletBalance');
      const totalAdminBalance = admins.reduce((sum, admin) => sum + (admin.walletBalance || 0), 0);
      return successResponse(res, { walletBalance: totalAdminBalance });
    }

    const user = await User.findById(req.user._id).select('walletBalance name email');
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, { walletBalance: user.walletBalance });
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };
    
    if (req.user.role === 'admin') {
      // Admins should see all platform-wide wallet transactions (commissions and reversals)
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(a => a._id);
      query = { userId: { $in: adminIds } };
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(query),
    ]);

    return paginatedResponse(res, transactions, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    console.log('💳 createOrder req.body:', req.body);
    const { amount } = req.body; // amount in INR
    if (!amount || amount < 100) {
      return errorResponse(res, `Minimum top-up amount is ₹100. Received: ${amount}`, 400);
    }


    const amountInPaise = Math.round(amount * 100);

    if (isMockMode) {
      // Mock mode: generate a fake order for local testing
      const mockOrderId = `mock_order_${Date.now()}`;
      await Payment.create({
        userId: req.user._id,
        orderId: mockOrderId,
        amount: amountInPaise,
        status: PAYMENT_STATUS.PENDING,
        gateway: 'mock',
      });

      return successResponse(res, {
        orderId: mockOrderId,
        amount: amountInPaise,
        currency: 'INR',
        isMock: true,
        keyId: null,
      }, 'Mock order created (dev mode)');
    }

    // Live Razorpay order (receipt must be <= 40 chars)
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `topup_${String(req.user._id).slice(-8)}_${Date.now()}`,
    });

    await Payment.create({
      userId: req.user._id,
      orderId: order.id,
      amount: amountInPaise,
      status: PAYMENT_STATUS.PENDING,
      gateway: 'razorpay',
    });

    return successResponse(res, {
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      isMock: false,
      keyId: process.env.RAZORPAY_KEY_ID,
    }, 'Razorpay order created');
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId) {
      return errorResponse(res, 'orderId and paymentId are required', 400);
    }

    const payment = await Payment.findOne({ orderId, userId: req.user._id });
    if (!payment) return errorResponse(res, 'Payment record not found', 404);
    if (payment.status === PAYMENT_STATUS.CAPTURED) {
      return errorResponse(res, 'Payment already processed', 400);
    }

    // Verify HMAC signature for live mode
    if (!isMockMode) {
      if (!signature) return errorResponse(res, 'Payment signature is required', 400);
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      if (expectedSignature !== signature) {
        return errorResponse(res, 'Payment signature verification failed', 400);
      }
    }

    // Mark payment captured
    payment.paymentId = paymentId;
    payment.status = PAYMENT_STATUS.CAPTURED;
    payment.signature = signature || null;
    await payment.save();

    // Credit wallet (amount was stored in paise, convert back to INR)
    const amountInINR = Math.round(payment.amount / 100);
    await creditWallet(
      req.user._id,
      amountInINR,
      `Wallet top-up of ₹${amountInINR}`,
      { paymentId: payment._id, type: TRANSACTION_TYPES.CREDIT }
    );

    const updatedUser = await User.findById(req.user._id).select('walletBalance');

    return successResponse(res, {
      walletBalance: updatedUser.walletBalance,
      amountAdded: amountInINR,
    }, `₹${amountInINR} added to your wallet successfully`);
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    const event = req.body.event;
    const paymentData = req.body.payload?.payment?.entity;

    if (event === 'payment.captured' && paymentData) {
      const payment = await Payment.findOne({ orderId: paymentData.order_id });
      if (payment && payment.status !== PAYMENT_STATUS.CAPTURED) {
        payment.status = PAYMENT_STATUS.CAPTURED;
        payment.paymentId = paymentData.id;
        await payment.save();
        console.log(`Webhook: payment.captured for order ${paymentData.order_id}`);
      }
    }

    if (event === 'payment.failed' && paymentData) {
      const payment = await Payment.findOne({ orderId: paymentData.order_id });
      if (payment) {
        payment.status = PAYMENT_STATUS.FAILED;
        await payment.save();
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

