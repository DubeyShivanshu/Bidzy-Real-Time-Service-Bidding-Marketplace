/**
 * routes/chat/chat.routes.js — Chat Routes (REST)
 *
 * Routes:
 *  GET    /:bookingId/history  — Fetch message history for a booking's chat room
 *
 * Note: Real-time messaging is handled via Socket.io (sockets/chat.socket.js).
 * This REST endpoint is for loading historical messages on chat room join.
 */

import { Router } from 'express';
import * as chatController from '../../controllers/chat/chat.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.get('/:bookingId/history', protect, authorize('customer', 'provider', 'admin'), chatController.getChatHistory);

export default router;
