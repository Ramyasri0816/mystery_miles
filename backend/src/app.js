import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import env from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const app = express();

// CORS configuration supporting credentials (cookies)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const allowedOrigins = env.CLIENT_URL
        ? env.CLIENT_URL.split(',').map((url) => url.trim().replace(/\/$/, ''))
        : [];
      const cleanOrigin = origin.replace(/\/$/, '');

      if (
        env.NODE_ENV === 'development' ||
        allowedOrigins.includes(cleanOrigin) ||
        origin === env.CLIENT_URL ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        cleanOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`Blocked by CORS policy: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Standard parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'MysteryMiles API',
    tagline: 'Personalized Travel Discovery Platform',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: 'GET /api/health',
      destinations: 'GET /api/destinations',
      discover: 'GET /api/destinations/discover',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        profile: 'PUT /api/auth/profile',
        preferences: 'PUT /api/auth/preferences'
      },
      savedTrips: 'GET /api/saved-trips, POST /api/saved-trips',
      reviews: 'POST /api/destinations/:id/reviews, GET /api/destinations/:id/reviews'
    }
  });
});

// Mount Central API Routes under /api
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
