import { Router } from 'express';
import authRoutes from './modules/auth/auth.route';
import healthRoutes from './modules/health/health.route';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);

export default router;
