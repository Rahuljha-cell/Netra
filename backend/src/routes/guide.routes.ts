import { Router } from 'express';
import { listGuides, getGuide } from '../controllers/guide.controller';
import { validateObjectId } from '../middleware/validation';

const router = Router();

router.get('/', listGuides);
router.get('/:id', validateObjectId, getGuide);

export default router;
