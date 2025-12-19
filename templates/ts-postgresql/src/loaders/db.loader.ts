import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

export const prisma = new PrismaClient();

export const connect = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL');
  } catch (error) {
    logger.error('PostgreSQL connection error:', error);
    throw error;
  }
};

export const disconnect = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Disconnected from PostgreSQL');
  } catch (error) {
    logger.error('PostgreSQL disconnection error:', error);
    throw error;
  }
};
