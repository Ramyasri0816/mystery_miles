import express from 'express';
import {
  createSavedTrip,
  getMySavedTrips,
  updateSavedTrip,
  deleteSavedTrip
} from '../controllers/savedTrip.controller.js';
import validate from '../middleware/validate.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  createSavedTripSchema,
  updateSavedTripSchema,
  savedTripIdParamSchema
} from '../validators/savedTrip.validator.js';

const router = express.Router();

// All wishlist / saved trip routes require authentication
router.use(authenticateToken);

router.post('/', validate(createSavedTripSchema, 'body'), createSavedTrip);
router.get('/', getMySavedTrips);
router.put('/:id', validate(savedTripIdParamSchema, 'params'), validate(updateSavedTripSchema, 'body'), updateSavedTrip);
router.delete('/:id', validate(savedTripIdParamSchema, 'params'), deleteSavedTrip);

export default router;
