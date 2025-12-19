import app from './app';
import config from './config';
import logger from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
      logger.info('Using in-memory storage (data will be lost on restart)');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer();
