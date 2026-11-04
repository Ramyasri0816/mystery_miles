import express from 'express';
import mongoose from 'mongoose';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import destinationRoutes from './destination.routes.js';
import discoveryRoutes from './discovery.routes.js';
import savedTripRoutes from './savedTrip.routes.js';
import reviewRoutes from './review.routes.js';
import historyRoutes from './history.routes.js';
import { apiError } from '../utils/apiResponse.js';

const router = express.Router();

// Middleware to guard database-dependent routes against silent offline failure
const requireDatabase = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return apiError(res, {
      statusCode: 503,
      message: 'Database service is currently unavailable. Please verify the MongoDB Atlas connection.'
    });
  }
  next();
};

// Health endpoint remains accessible without database connection for diagnostics
router.use('/', healthRoutes);

// Protect database-dependent endpoints
router.use('/auth', requireDatabase, authRoutes);
router.use('/destinations', requireDatabase, destinationRoutes);
router.use('/discovery', requireDatabase, discoveryRoutes);
router.use('/saved-trips', requireDatabase, savedTripRoutes);
router.use('/reviews', requireDatabase, reviewRoutes);
router.use('/history', requireDatabase, historyRoutes);

export default router;
