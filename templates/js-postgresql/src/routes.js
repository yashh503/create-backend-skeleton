const express = require('express');
const authRoutes = require('./modules/auth/auth.route');
const healthRoutes = require('./modules/health/health.route');

const router = express.Router();

// Health check
router.use('/health', healthRoutes);

// Auth routes
router.use('/auth', authRoutes);

module.exports = router;
