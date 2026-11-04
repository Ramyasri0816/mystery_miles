import express from 'express';
import { getDBStatus } from '../config/db.js';
import env from '../config/env.js';

const router = express.Router();

router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  const isHealthy = dbStatus.isConnected;

  return res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    message: isHealthy
      ? 'MysteryMiles API is healthy and operational'
      : 'MysteryMiles API is degraded: Database connection is unavailable',
    data: {
      status: isHealthy ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      database: dbStatus
    }
  });
});

export default router;
