import express from 'express';
import {
  getMyDiscoveryHistory,
  clearDiscoveryHistory
} from '../controllers/history.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getMyDiscoveryHistory);
router.delete('/', clearDiscoveryHistory);

export default router;
