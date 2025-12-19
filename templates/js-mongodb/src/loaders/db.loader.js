const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');

const connect = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    throw error;
  }
};

const disconnect = async () => {
  try {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  } catch (error) {
    logger.error('MongoDB disconnection error:', error);
    throw error;
  }
};

module.exports = { connect, disconnect };
