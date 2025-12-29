import express from 'express';
import authRoutes from './modules/auth/auth.route.js';
import healthRoutes from './modules/health/health.route.js';

const router = express.Router();

// Health check
router.use('/health', healthRoutes);

// Auth routes
router.use('/auth', authRoutes);

export default router;
