const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('../routes');
const errorMiddleware = require('../middlewares/error.middleware');
const notFoundMiddleware = require('../middlewares/notFound.middleware');

const expressLoader = (app) => {
  // Trust proxy (for rate limiting behind reverse proxy)
  app.set('trust proxy', 1);

  // Parse JSON bodies
  app.use(express.json());

  // Parse URL-encoded bodies
  app.use(express.urlencoded({ extended: true }));

  // Enable CORS
  app.use(cors());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // API routes
  app.use('/api', routes);

  // 404 handler
  app.use(notFoundMiddleware);

  // Error handler
  app.use(errorMiddleware);
};

module.exports = expressLoader;
