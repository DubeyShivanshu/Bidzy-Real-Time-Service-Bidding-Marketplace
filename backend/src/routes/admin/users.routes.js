/**
 * Admin User Management Routes
 *
 * Routes:
 *  GET    /          — List all users (paginated, filterable by role)
 *  GET    /:id       — Get single user details
 *  PATCH  /:id/suspend   — Suspend a user account
 *  PATCH  /:id/activate  — Reactivate a suspended user account
 */

import { Router } from 'express';
import * as usersController from '../../controllers/admin/users.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';

const router = Router();

router.get('/', protect, authorize('admin'), usersController.getAllUsers);
router.get('/:id', protect, authorize('admin'), usersController.getUserById);
router.patch('/:id/suspend', protect, authorize('admin'), usersController.suspendUser);
router.patch('/:id/activate', protect, authorize('admin'), usersController.activateUser);

export default router;
