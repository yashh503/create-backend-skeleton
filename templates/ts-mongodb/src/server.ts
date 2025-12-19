import app from './app';
import config from './config';
import logger from './utils/logger';
import * as dbLoader from './loaders/db.loader';

const startServer = async (): Promise<void> => {
  try {
    await dbLoader.connect();

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.env} mode`);
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
