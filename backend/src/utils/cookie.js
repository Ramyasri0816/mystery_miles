import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { apiSuccess } from './apiResponse.js';

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role || 'user'
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

export const sendTokenResponse = (res, user, statusCode = 200, message = 'Success') => {
  const token = generateToken(user);
  const cookieOptions = getCookieOptions();

  res.cookie('token', token, cookieOptions);

  return apiSuccess(res, {
    statusCode,
    message,
    data: {
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'user',
        avatar: user.avatar,
        bio: user.bio,
        travelPreferences: user.travelPreferences,
        createdAt: user.createdAt
      },
      token
    }
  });
};

export const clearTokenCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
};
