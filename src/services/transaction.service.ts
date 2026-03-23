import { Transaction, ITransaction } from '@/models/Transaction.model';
import { AppError } from '@/middleware/errorHandler';

export interface ICreateTransactionInput {
  transactionType: 'income' | 'expense';
  category: string;
  amount: number;
  transactionDate: Date | string;
  description: string;
  playerId?: string;
  playerName?: string;
  matchId?: string;
  notes?: string;
}

export interface ITransactionFilters {
  transactionType?: 'income' | 'expense';
  category?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

export class TransactionService {
  /**
   * Create a new transaction
   */
  static async createTransaction(data: ICreateTransactionInput): Promise<ITransaction> {
    const transaction = await Transaction.create(data);
    return transaction;
  }

  /**
   * Get all transactions with optional filters
   */
  static async getTransactions(filters?: ITransactionFilters): Promise<ITransaction[]> {
    const query: any = {};

    if (filters?.transactionType) {
      query.transactionType = filters.transactionType;
    }

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      query.transactionDate = {};
      if (filters.dateFrom) {
        query.transactionDate.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.transactionDate.$lte = new Date(filters.dateTo);
      }
    }

    const transactions = await Transaction.find(query)
      .sort({ transactionDate: -1 })
      .populate('playerId', 'name')
      .populate('matchId', 'matchDate groundName');

    return transactions;
  }

  /**
   * Get transaction by ID
   */
  static async getTransactionById(id: string): Promise<ITransaction> {
    const transaction = await Transaction.findById(id)
      .populate('playerId', 'name')
      .populate('matchId', 'matchDate groundName');

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    return transaction;
  }

  /**
   * Update transaction
   */
  static async updateTransaction(
    id: string,
    data: Partial<ICreateTransactionInput>
  ): Promise<ITransaction> {
    const transaction = await Transaction.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    })
      .populate('playerId', 'name')
      .populate('matchId', 'matchDate groundName');

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    return transaction;
  }

  /**
   * Delete transaction
   */
  static async deleteTransaction(id: string): Promise<void> {
    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }
  }
}
