import User from '../models/User.model.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { sendTokenResponse, clearTokenCookie } from '../utils/cookie.js';

/**
 * Register a new user
 * Enforces role: 'user' to prevent privilege escalation
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiError(res, {
        statusCode: 409,
        message: 'A user with this email address already exists.'
      });
    }

    // Role is strictly locked to 'user'
    const user = await User.create({
      name,
      email,
      password,
      role: 'user'
    });

    return sendTokenResponse(res, user, 201, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Log in an existing user
 * Sets HTTP-only authentication cookie
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return apiError(res, {
        statusCode: 401,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return apiError(res, {
        statusCode: 401,
        message: 'Invalid email or password.'
      });
    }

    return sendTokenResponse(res, user, 200, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Log out user by clearing the HTTP-only cookie
 */
export const logout = async (req, res) => {
  clearTokenCookie(res);
  return apiSuccess(res, {
    message: 'Logged out successfully'
  });
};

/**
 * Get current authenticated user profile
 */
export const getMe = async (req, res) => {
  return apiSuccess(res, {
    message: 'User profile retrieved successfully',
    data: {
      user: req.user
    }
  });
};

/**
 * Update user basic profile (name, bio, avatar)
 * Prevents changing privileged role
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;

    const user = req.user;
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    return apiSuccess(res, {
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user travel preferences
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const { startingLocation, budgetTier, preferredStyle, interests, preferredDurationDays } = req.body;

    const user = req.user;
    if (!user.travelPreferences) {
      user.travelPreferences = {};
    }

    if (startingLocation !== undefined) user.travelPreferences.startingLocation = startingLocation;
    if (budgetTier !== undefined) user.travelPreferences.budgetTier = budgetTier;
    if (preferredStyle !== undefined) user.travelPreferences.preferredStyle = preferredStyle;
    if (interests !== undefined) user.travelPreferences.interests = interests;
    if (preferredDurationDays !== undefined) user.travelPreferences.preferredDurationDays = preferredDurationDays;

    await user.save();

    return apiSuccess(res, {
      message: 'Travel preferences updated successfully',
      data: {
        travelPreferences: user.travelPreferences
      }
    });
  } catch (error) {
    next(error);
  }
};
