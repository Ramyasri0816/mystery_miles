import express from 'express';
import {
  updateReview,
  deleteReview
} from '../controllers/review.controller.js';
import validate from '../middleware/validate.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  updateReviewSchema,
  reviewIdParamSchema
} from '../validators/review.validator.js';

const router = express.Router();

// Managing individual reviews by ID requires authentication
router.use(authenticateToken);

router.put('/:id', validate(reviewIdParamSchema, 'params'), validate(updateReviewSchema, 'body'), updateReview);
router.delete('/:id', validate(reviewIdParamSchema, 'params'), deleteReview);

export default router;
