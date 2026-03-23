import { Request, Response, NextFunction } from 'express';
import { FinanceService } from '@/services/finance.service';

const financeService = new FinanceService();

/**
 * @swagger
 * /api/v1/finance/summary:
 *   get:
 *     summary: Get finance summary
 *     tags: [Finances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Finance summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                     totalExpenses:
 *                       type: number
 *                     corpus:
 *                       type: number
 *                     totalPending:
 *                       type: number
 *                     incomeBreakdown:
 *                       type: object
 *                     expenseBreakdown:
 *                       type: object
 */
export const getFinanceSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const from = dateFrom ? new Date(dateFrom as string) : undefined;
    const to = dateTo ? new Date(dateTo as string) : undefined;

    const summary = await financeService.getFinanceSummary(from, to);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/finance/pending-collections:
 *   get:
 *     summary: Get all matches with pending payments
 *     tags: [Finances]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of matches with pending collections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       matchId:
 *                         type: string
 *                       matchDate:
 *                         type: string
 *                         format: date
 *                       groundName:
 *                         type: string
 *                       matchType:
 *                         type: string
 *                       pendingPlayersCount:
 *                         type: number
 *                       pendingAmount:
 *                         type: number
 *                       totalPlayers:
 *                         type: number
 *                       paidPlayers:
 *                         type: number
 */
export const getPendingCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pendingCollections = await financeService.getPendingCollections();

    res.json({
      success: true,
      data: pendingCollections
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/v1/finance/income-by-match-type:
 *   get:
 *     summary: Get income breakdown by match type
 *     tags: [Finances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Income by match type
 */
export const getIncomeByMatchType = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo } = req.query;

    const from = dateFrom ? new Date(dateFrom as string) : undefined;
    const to = dateTo ? new Date(dateTo as string) : undefined;

    const breakdown = await financeService.getIncomeByMatchType(from, to);

    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    next(error);
  }
};
