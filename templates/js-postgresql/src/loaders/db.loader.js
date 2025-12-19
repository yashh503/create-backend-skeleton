const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const connect = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL');
  } catch (error) {
    logger.error('PostgreSQL connection error:', error);
    throw error;
  }
};

const disconnect = async () => {
  try {
    await prisma.$disconnect();
    logger.info('Disconnected from PostgreSQL');
  } catch (error) {
    logger.error('PostgreSQL disconnection error:', error);
    throw error;
  }
};

module.exports = { prisma, connect, disconnect };
