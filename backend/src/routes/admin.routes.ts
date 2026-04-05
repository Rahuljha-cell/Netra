import { Router } from 'express';
import {
  getModerationQueue,
  moderateIncident,
  getAnalytics,
} from '../controllers/admin.controller';
import { auth, requireRole } from '../middleware/auth';

const router = Router();

// All admin routes require authentication + admin/moderator role
router.use(auth, requireRole('admin', 'moderator'));

router.get('/moderation', getModerationQueue);
router.patch('/incidents/:id', moderateIncident);
router.get('/analytics', getAnalytics);

export default router;
