import { Router } from 'express';
import {
  listIncidents,
  getIncident,
  createIncident,
  getNearbyIncidents,
  getHeatmapData,
  getStats,
  voteIncident,
  getFeed,
  getMapDots,
  incrementView,
  getScraperHealth,
} from '../controllers/incident.controller';
import { auth } from '../middleware/auth';
import {
  validateCreateIncident,
  validateNearbyQuery,
  validateVote,
  validateObjectId,
} from '../middleware/validation';

const router = Router();

router.get('/', listIncidents);
router.get('/feed', getFeed);
router.get('/map-dots', getMapDots);
router.get('/nearby', validateNearbyQuery, getNearbyIncidents);
router.get('/heatmap', getHeatmapData);
router.get('/stats', getStats);
router.get('/scraper-health', getScraperHealth);
router.get('/:id', validateObjectId, getIncident);
router.post('/', auth, validateCreateIncident, createIncident);
router.patch('/:id/vote', auth, validateVote, voteIncident);
router.patch('/:id/view', incrementView);

export default router;
