import express from 'express';
import {
  discoverDestinations,
  getAllDestinations,
  getDestinationById
} from '../controllers/travel.controller.js';
import validate from '../middleware/validate.middleware.js';
import { travelDiscoverySchema, destinationIdSchema } from '../validators/travel.validator.js';

const router = express.Router();

// GET /api/destinations/discover - Search with budget, available time, interests, starting location, style
router.get('/discover', validate(travelDiscoverySchema, 'query'), discoverDestinations);

// GET /api/destinations - List all destinations
router.get('/', getAllDestinations);

// GET /api/destinations/:id - Single destination details
router.get('/:id', validate(destinationIdSchema, 'params'), getDestinationById);

export default router;
