/**
 * Job Routes
 *
 * Routes:
 *  POST   /              — Create a new job (Customer only)
 *  GET    /              — Get open jobs (Provider — geo-filtered by provider's city)
 *  GET    /customer/my   — Get current customer's jobs
 *  GET    /:id           — Get single job by ID (Auth: customer or provider)
 *  PATCH  /:id/expire    — Manually expire a job (Admin or system)
 *  DELETE /:id           — Cancel a job (Customer — only if OPEN and no accepted bid)
 */

import { Router } from 'express';
import * as jobController from '../../controllers/jobs/job.controller.js';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/role.js';
import { jobUpload } from '../../middleware/jobUpload.js';

const router = Router();

router.post('/', protect, authorize('customer'), jobUpload.single('image'), jobController.createJob);
router.get('/', protect, authorize('provider'), jobController.getOpenJobs);
router.get('/customer/my', protect, authorize('customer'), jobController.getMyJobs);
router.get('/:id', protect, authorize('customer', 'provider', 'admin'), jobController.getJobById);
router.patch('/:id/expire', protect, authorize('admin'), jobController.expireJob);
router.delete('/:id', protect, authorize('customer'), jobController.cancelJob);

export default router;
