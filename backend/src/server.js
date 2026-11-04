import app from './app.js';
import env from './config/env.js';
import connectDB from './config/db.js';
import logger from './utils/logger.js';

const startServer = () => {
  try {
    const server = app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`MysteryMiles Backend running on http://0.0.0.0:${env.PORT}`);
      logger.info(`Health check: http://0.0.0.0:${env.PORT}/api/health`);
      logger.info(`Environment: ${env.NODE_ENV}`);

      // Connect to MongoDB asynchronously after HTTP listener binds
      connectDB().catch((err) => {
        logger.error('Initial database connection failure:', err.message);
      });
    });

    const shutdown = () => {
      logger.info('Gracefully shutting down server...');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
