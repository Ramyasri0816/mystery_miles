import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePreferences
} from '../controllers/auth.controller.js';
import validate from '../middleware/validate.middleware.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updatePreferencesSchema
} from '../validators/auth.validator.js';

const router = express.Router();

// Public auth endpoints
router.post('/register', validate(registerSchema, 'body'), register);
router.post('/login', validate(loginSchema, 'body'), login);
router.post('/logout', logout);

// Protected user profile & preferences endpoints
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, validate(updateProfileSchema, 'body'), updateProfile);
router.put('/preferences', authenticateToken, validate(updatePreferencesSchema, 'body'), updatePreferences);

// Convenience combined endpoint
router.put('/me', authenticateToken, async (req, res, next) => {
  if (req.body.startingLocation || req.body.budgetTier || req.body.preferredStyle || req.body.interests) {
    return updatePreferences(req, res, next);
  }
  return updateProfile(req, res, next);
});

export default router;
