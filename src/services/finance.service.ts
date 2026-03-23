import { Match } from '@/models/Match.model';
import { Transaction } from '@/models/Transaction.model';

interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  corpus: number;
  totalPending: number;
  incomeBreakdown: {
    matchFees: number;
    jerseyPayments: number;
    other: number;
  };
  expenseBreakdown: {
    groundBookings: number;
    trophies: number;
    equipment: number;
    playerSponsorships: number;
    other: number;
  };
}

interface PendingCollection {
  matchId: string;
  matchDate: Date;
  groundName: string;
  matchType: string;
  pendingPlayersCount: number;
  pendingAmount: number;
  totalPlayers: number;
  paidPlayers: number;
}

export class FinanceService {
  /**
   * Get finance summary for a date range
   */
  async getFinanceSummary(dateFrom?: Date, dateTo?: Date): Promise<FinanceSummary> {
    const dateFilter: any = {};
    if (dateFrom || dateTo) {
      dateFilter.transactionDate = {};
      if (dateFrom) dateFilter.transactionDate.$gte = dateFrom;
      if (dateTo) dateFilter.transactionDate.$lte = dateTo;
    }

    // Get all transactions
    const transactions = await Transaction.find(dateFilter);

    // Calculate income
    const incomeTransactions = transactions.filter((t) => t.transactionType === 'income');
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    const matchFees = incomeTransactions
      .filter((t) => t.category === 'match_fee')
      .reduce((sum, t) => sum + t.amount, 0);

    const jerseyPayments = incomeTransactions
      .filter((t) => t.category === 'jersey_payment')
      .reduce((sum, t) => sum + t.amount, 0);

    const otherIncome = incomeTransactions
      .filter((t) => t.category === 'other_income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate expenses
    const expenseTransactions = transactions.filter((t) => t.transactionType === 'expense');
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    const groundBookings = expenseTransactions
      .filter((t) => t.category === 'ground_booking')
      .reduce((sum, t) => sum + t.amount, 0);

    const trophies = expenseTransactions
      .filter((t) => t.category === 'trophy')
      .reduce((sum, t) => sum + t.amount, 0);

    const equipment = expenseTransactions
      .filter((t) => t.category === 'equipment')
      .reduce((sum, t) => sum + t.amount, 0);

    const playerSponsorships = expenseTransactions
      .filter((t) => t.category === 'player_sponsorship')
      .reduce((sum, t) => sum + t.amount, 0);

    const otherExpenses = expenseTransactions
      .filter((t) => t.category === 'other_expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Get pending collections from matches
    const matchDateFilter: any = {};
    if (dateFrom || dateTo) {
      matchDateFilter.matchDate = {};
      if (dateFrom) matchDateFilter.matchDate.$gte = dateFrom;
      if (dateTo) matchDateFilter.matchDate.$lte = dateTo;
    }

    const matches = await Match.find({
      ...matchDateFilter,
      status: { $ne: 'cancelled' }
    });

    const totalPending = matches.reduce((sum, match) => sum + match.totalPending, 0);

    // Calculate corpus
    const corpus = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      corpus,
      totalPending,
      incomeBreakdown: {
        matchFees,
        jerseyPayments,
        other: otherIncome
      },
      expenseBreakdown: {
        groundBookings,
        trophies,
        equipment,
        playerSponsorships,
        other: otherExpenses
      }
    };
  }

  /**
   * Get all matches with pending payments
   */
  async getPendingCollections(): Promise<PendingCollection[]> {
    const matches = await Match.find({
      status: { $in: ['upcoming', 'completed'] },
      totalPending: { $gt: 0 }
    }).sort({ matchDate: 1 });

    return matches.map((match) => {
      const totalPlayers = match.selectedPlayers.length + match.waitingPlayers.length;
      const paidPlayers = [...match.selectedPlayers, ...match.waitingPlayers].filter(
        (p) => p.hasPaid
      ).length;
      const pendingPlayersCount = totalPlayers - paidPlayers;

      return {
        matchId: match._id.toString(),
        matchDate: match.matchDate,
        groundName: match.groundName,
        matchType: match.matchType,
        pendingPlayersCount,
        pendingAmount: match.totalPending,
        totalPlayers,
        paidPlayers
      };
    });
  }

  /**
   * Get income breakdown by match type
   */
  async getIncomeByMatchType(dateFrom?: Date, dateTo?: Date): Promise<{
    practiceMatches: number;
    tournamentMatches: number;
  }> {
    const dateFilter: any = {};
    if (dateFrom || dateTo) {
      dateFilter.matchDate = {};
      if (dateFrom) dateFilter.matchDate.$gte = dateFrom;
      if (dateTo) dateFilter.matchDate.$lte = dateTo;
    }

    const practiceMatches = await Match.find({
      ...dateFilter,
      matchType: 'practice',
      status: { $ne: 'cancelled' }
    });

    const tournamentMatches = await Match.find({
      ...dateFilter,
      matchType: 'tournament',
      status: { $ne: 'cancelled' }
    });

    const practiceIncome = practiceMatches.reduce((sum, m) => sum + m.totalCollected, 0);
    const tournamentIncome = tournamentMatches.reduce((sum, m) => sum + m.totalCollected, 0);

    return {
      practiceMatches: practiceIncome,
      tournamentMatches: tournamentIncome
    };
  }
}
