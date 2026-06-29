/**
 * routes/providers/provider.routes.js — Provider Profile Routes
 *
 * Routes:
 *  GET    /:id               — Get public provider profile (Auth: any role)
 *  PATCH  /profile           — Update provider's own profile (Provider)
 *  POST   /verification      — Submit verification documents (Provider)
 *  GET    /verification/status — Check own verification status (Provider)
 */

import { Router } from 'express';
import * as providerController from '../../controllers/providers/provider.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';
import { upload } from '../../middleware/upload.js';

const router = Router();

router.get('/verification/status', protect, authorize('provider'), providerController.getVerificationStatus);
router.get('/:id', protect, providerController.getProviderProfile);
router.patch('/profile', protect, authorize('provider'), providerController.updateProfile);
router.post(
  '/verification',
  protect,
  authorize('provider'),
  upload.fields([{ name: 'aadhaar', maxCount: 1 }, { name: 'pan', maxCount: 1 }, { name: 'other', maxCount: 3 }]),
  providerController.submitVerification
);

export default router;
