import { Response, NextFunction } from 'express';
import { TransactionService } from '@/services/transaction.service';
import { ApiResponse } from '@/utils/apiResponse';
import { IAuthRequest } from '@/types/auth.types';
import { z } from 'zod';

// Validation schemas
const createTransactionSchema = z.object({
  transactionType: z.enum(['income', 'expense'], {
    required_error: 'Transaction type is required',
    invalid_type_error: 'Transaction type must be either income or expense'
  }),
  category: z.enum([
    'match_fee',
    'jersey_payment',
    'other_income',
    'ground_booking',
    'trophy',
    'equipment',
    'player_sponsorship',
    'other_expense'
  ], {
    required_error: 'Category is required'
  }),
  amount: z.number().positive('Amount must be positive'),
  transactionDate: z.string().or(z.date()),
  description: z.string().min(1, 'Description is required'),
  playerId: z.string().optional(),
  playerName: z.string().optional(),
  matchId: z.string().optional(),
  notes: z.string().optional()
});

const updateTransactionSchema = createTransactionSchema.partial();

export class TransactionController {
  /**
   * Create a new transaction
   * POST /api/v1/transactions
   */
  static async createTransaction(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createTransactionSchema.parse(req.body);
      const transaction = await TransactionService.createTransaction(validatedData);
      return ApiResponse.created(res, transaction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all transactions with optional filters
   * GET /api/v1/transactions
   */
  static async getTransactions(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const { transactionType, category, dateFrom, dateTo } = req.query;

      const filters: any = {};
      if (transactionType) filters.transactionType = transactionType as string;
      if (category) filters.category = category as string;
      if (dateFrom) filters.dateFrom = dateFrom as string;
      if (dateTo) filters.dateTo = dateTo as string;

      const transactions = await TransactionService.getTransactions(filters);
      return ApiResponse.success(res, transactions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get transaction by ID
   * GET /api/v1/transactions/:id
   */
  static async getTransactionById(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const transaction = await TransactionService.getTransactionById(id);
      return ApiResponse.success(res, transaction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update transaction
   * PUT /api/v1/transactions/:id
   */
  static async updateTransaction(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedData = updateTransactionSchema.parse(req.body);
      const transaction = await TransactionService.updateTransaction(id, validatedData);
      return ApiResponse.success(res, transaction);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete transaction
   * DELETE /api/v1/transactions/:id
   */
  static async deleteTransaction(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await TransactionService.deleteTransaction(id);
      return ApiResponse.success(res, { message: 'Transaction deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
