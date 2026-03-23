import { Router } from 'express';
import { authenticate } from '@/middleware/auth.middleware';
import { adminOnly } from '@/middleware/authorize.middleware';
import * as financeController from '@/controllers/finance.controller';

const router = Router();

// All finance routes require authentication and admin access
router.use(authenticate);
router.use(adminOnly);

/**
 * @swagger
 * tags:
 *   name: Finances
 *   description: Finance management and reporting
 */

router.get('/summary', financeController.getFinanceSummary);
router.get('/pending-collections', financeController.getPendingCollections);
router.get('/income-by-match-type', financeController.getIncomeByMatchType);

export default router;
