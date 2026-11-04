import express from 'express';
import {
  spinMysteryDestination,
  getDiscoveryHistory,
  getStartingLocations
} from '../controllers/discovery.controller.js';
import validate from '../middleware/validate.middleware.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';
import { spinDiscoverySchema } from '../validators/discovery.validator.js';

const router = express.Router();

// POST /api/discovery/spin - Spin the Mystery Destination Matching Engine
router.post('/spin', optionalAuth, validate(spinDiscoverySchema, 'body'), spinMysteryDestination);

// GET /api/discovery/history - Retrieve user's discovery spin history
router.get('/history', authenticateToken, getDiscoveryHistory);

// GET /api/discovery/starting-locations - Directory of supported Indian starting locations & hubs
router.get('/starting-locations', getStartingLocations);

export default router;
