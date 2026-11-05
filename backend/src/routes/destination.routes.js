import express from 'express';
import {
  getDestinations,
  getDestinationById,
  discoverDestinations,
  seedDestinationsHandler
} from '../controllers/destination.controller.js';
import {
  createReview,
  getDestinationReviews
} from '../controllers/review.controller.js';
import validate from '../middleware/validate.middleware.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.middleware.js';
import {
  destinationQuerySchema,
  destinationIdParamSchema,
  discoveryQuerySchema
} from '../validators/destination.validator.js';
import {
  createReviewSchema,
  destinationReviewParamSchema
} from '../validators/review.validator.js';

const router = express.Router();

// GET /api/destinations/discover - Personalized discovery engine (with optional user history recording)
router.get('/discover', optionalAuth, validate(discoveryQuerySchema, 'query'), discoverDestinations);

// GET /api/destinations - Full search, filter, pagination, sorting
router.get('/', validate(destinationQuerySchema, 'query'), getDestinations);

// Seed endpoint (supports GET & POST for convenient population)
router.get('/seed', seedDestinationsHandler);
router.post('/seed', seedDestinationsHandler);

// GET /api/destinations/:id - Details of single destination
router.get('/:id', validate(destinationIdParamSchema, 'params'), getDestinationById);

// Reviews nested under destination
router.get('/:destinationId/reviews', validate(destinationReviewParamSchema, 'params'), getDestinationReviews);
router.post(
  '/:destinationId/reviews',
  authenticateToken,
  validate(destinationReviewParamSchema, 'params'),
  validate(createReviewSchema, 'body'),
  createReview
);

export default router;
