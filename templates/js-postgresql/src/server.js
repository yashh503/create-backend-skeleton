const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const dbLoader = require('./loaders/db.loader');

const startServer = async () => {
  try {
    // Connect to database
    await dbLoader.connect();

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down...');
  await dbLoader.disconnect();
  process.exit(0);
});

startServer();
