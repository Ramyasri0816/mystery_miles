import express from 'express';
import { apiSuccess } from '../utils/apiResponse.js';
import { getDBStatus } from '../config/db.js';
import env from '../config/env.js';

const router = express.Router();

router.get('/health', (req, res) => {
  return apiSuccess(res, {
    message: 'MysteryMiles API is healthy and operational',
    data: {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      database: {
        status: getDBStatus()
      }
    }
  });
});

export default router;
