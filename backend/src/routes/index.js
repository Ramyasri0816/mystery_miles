import express from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import destinationRoutes from './destination.routes.js';
import discoveryRoutes from './discovery.routes.js';
import savedTripRoutes from './savedTrip.routes.js';
import reviewRoutes from './review.routes.js';
import historyRoutes from './history.routes.js';

const router = express.Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/destinations', destinationRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/saved-trips', savedTripRoutes);
router.use('/reviews', reviewRoutes);
router.use('/history', historyRoutes);

export default router;
