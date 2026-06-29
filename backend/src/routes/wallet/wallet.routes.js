/**
 * routes/wallet/wallet.routes.js — Wallet Routes
 *
 * Routes:
 *  GET    /                    — Get current user's wallet balance
 *  GET    /transactions        — Get current user's transaction history (paginated)
 *  POST   /create-order        — Create Razorpay order for top-up (Customer)
 *  POST   /verify-payment      — Verify Razorpay signature + credit wallet (Customer)
 *  POST   /webhook             — Razorpay webhook endpoint (public, signature-verified)
 *
 * Note: /webhook is PUBLIC but verifies Razorpay HMAC signature internally.
 */

import { Router } from 'express';
import * as walletController from '../../controllers/wallet/wallet.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.get('/', protect, authorize('customer', 'provider', 'admin'), walletController.getWallet);
router.get('/transactions', protect, authorize('customer', 'provider', 'admin'), walletController.getTransactions);
router.post('/create-order', protect, authorize('customer'), walletController.createOrder);
router.post('/verify-payment', protect, authorize('customer'), walletController.verifyPayment);
router.post('/webhook', walletController.handleWebhook); // Public — Razorpay signed

export default router;
