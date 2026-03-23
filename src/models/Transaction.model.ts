import mongoose, { Schema, Document } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - transactionType
 *         - category
 *         - amount
 *         - transactionDate
 *       properties:
 *         transactionType:
 *           type: string
 *           enum: [income, expense]
 *           description: Type of transaction
 *         category:
 *           type: string
 *           enum: [match_fee, jersey_payment, other_income, ground_booking, trophy, equipment, player_sponsorship, other_expense]
 *           description: Category of transaction
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         transactionDate:
 *           type: string
 *           format: date
 *           description: Date of transaction
 *         description:
 *           type: string
 *           description: Description of the transaction
 *         playerId:
 *           type: string
 *           description: Reference to Player (for income tracking or player sponsorships)
 *         playerName:
 *           type: string
 *           description: Player name for display
 *         matchId:
 *           type: string
 *           description: Reference to Match (for ground bookings or match-related expenses)
 *         notes:
 *           type: string
 *           description: Additional notes
 */

export interface ITransaction extends Document {
  transactionType: 'income' | 'expense';
  category:
    // Income categories
    | 'match_fee'
    | 'jersey_payment'
    | 'other_income'
    // Expense categories
    | 'ground_booking'
    | 'trophy'
    | 'equipment'
    | 'player_sponsorship'
    | 'other_expense';
  amount: number;
  transactionDate: Date;
  description: string;
  playerId?: mongoose.Types.ObjectId;
  playerName?: string;
  matchId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    transactionType: {
      type: String,
      required: true,
      enum: ['income', 'expense']
    },
    category: {
      type: String,
      required: true,
      enum: [
        // Income
        'match_fee',
        'jersey_payment',
        'other_income',
        // Expenses
        'ground_booking',
        'trophy',
        'equipment',
        'player_sponsorship',
        'other_expense'
      ]
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    transactionDate: {
      type: Date,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    playerId: {
      type: Schema.Types.ObjectId,
      ref: 'Player'
    },
    playerName: {
      type: String,
      trim: true
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: 'Match'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
TransactionSchema.index({ transactionDate: -1 });
TransactionSchema.index({ transactionType: 1 });
TransactionSchema.index({ category: 1 });
TransactionSchema.index({ playerId: 1 });
TransactionSchema.index({ matchId: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
