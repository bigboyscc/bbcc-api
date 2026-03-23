import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import playersRoutes from './players.routes';
import groundRoutes from './ground.routes';
import matchesRoutes from './matches.routes';
import financeRoutes from './finance.routes';
import transactionRoutes from './transaction.routes';

const router = Router();

// Health check
router.use(healthRoutes);

// API v1 routes
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/players', playersRoutes);
router.use('/api/v1/grounds', groundRoutes);
router.use('/api/v1/matches', matchesRoutes);
router.use('/api/v1/finance', financeRoutes);
router.use('/api/v1/transactions', transactionRoutes);

export default router;
