import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/pg-adapter';
import pg from 'pg';
import logger from '../utils/logger.js';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

export const connect = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL');
  } catch (error) {
    logger.error('PostgreSQL connection error:', error);
    throw error;
  }
};

export const disconnect = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Disconnected from PostgreSQL');
  } catch (error) {
    logger.error('PostgreSQL disconnection error:', error);
    throw error;
  }
};
