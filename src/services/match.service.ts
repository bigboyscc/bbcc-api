import { Match, IMatch } from '@/models/Match.model';
import { Transaction } from '@/models/Transaction.model';
import { Types } from 'mongoose';

export class MatchService {
  /**
   * Create a new match and auto-create ground booking transaction
   */
  async createMatch(matchData: Partial<IMatch>): Promise<IMatch> {
    const match = new Match(matchData);
    await match.save();

    // Auto-create transaction for ground booking
    await Transaction.create({
      transactionType: 'expense',
      category: 'ground_booking',
      amount: match.groundCost,
      transactionDate: match.matchDate,
      description: `Ground booking for ${match.matchType} match at ${match.groundName}`,
      matchId: match._id,
      notes: `Auto-created from match booking`
    });

    return match;
  }

  /**
   * Get all matches with optional filters
   */
  async getMatches(filters: {
    status?: string;
    matchType?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<IMatch[]> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.matchType) {
      query.matchType = filters.matchType;
    }
    if (filters.dateFrom || filters.dateTo) {
      query.matchDate = {};
      if (filters.dateFrom) {
        query.matchDate.$gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        query.matchDate.$lte = filters.dateTo;
      }
    }

    return Match.find(query)
      .sort({ matchDate: -1 })
      .populate('groundId', 'name address mapLink');
  }

  /**
   * Get match by ID
   */
  async getMatchById(matchId: string): Promise<IMatch | null> {
    return Match.findById(matchId).populate('groundId', 'name address mapLink ownerContacts');
  }

  /**
   * Update match
   */
  async updateMatch(matchId: string, updateData: Partial<IMatch>): Promise<IMatch | null> {
    const match = await Match.findById(matchId);
    if (!match) return null;

    // If ground cost changed, update the related transaction
    if (updateData.groundCost && updateData.groundCost !== match.groundCost) {
      await Transaction.findOneAndUpdate(
        { matchId: new Types.ObjectId(matchId), category: 'ground_booking' },
        { amount: updateData.groundCost }
      );
    }

    Object.assign(match, updateData);
    await match.save();

    return match;
  }

  /**
   * Cancel match (soft delete)
   */
  async cancelMatch(matchId: string): Promise<IMatch | null> {
    const match = await Match.findById(matchId);
    if (!match) return null;

    match.status = 'cancelled';
    await match.save();

    // Update related transaction to cancelled
    await Transaction.findOneAndUpdate(
      { matchId: new Types.ObjectId(matchId), category: 'ground_booking' },
      { notes: 'Match cancelled' }
    );

    return match;
  }

  /**
   * Toggle payment status for a player
   */
  async togglePayment(matchId: string, playerId: string): Promise<IMatch | null> {
    const match = await Match.findById(matchId);
    if (!match) return null;

    // Find player in selected players
    let player = match.selectedPlayers.find(
      (p) => p.playerId.toString() === playerId
    );

    // If not found, check waiting list
    if (!player) {
      player = match.waitingPlayers.find(
        (p) => p.playerId.toString() === playerId
      );
    }

    if (!player) {
      throw new Error('Player not found in this match');
    }

    // Toggle payment status
    player.hasPaid = !player.hasPaid;

    if (player.hasPaid) {
      // Mark as paid
      player.paidAmount = player.feeAmount;
      player.paidDate = new Date();
    } else {
      // Mark as unpaid
      player.paidAmount = 0;
      player.paidDate = undefined;
    }

    // Save will trigger pre-save hook to recalculate totals
    await match.save();

    return match;
  }

  /**
   * Generate WhatsApp message for a match
   */
  async generateWhatsAppMessage(matchId: string): Promise<string> {
    const match = await Match.findById(matchId).populate('groundId');
    if (!match) {
      throw new Error('Match not found');
    }

    // Format date (e.g., "14th Mar 2026")
    const matchDate = new Date(match.matchDate);
    const day = matchDate.getDate();
    const month = matchDate.toLocaleString('en-US', { month: 'short' });
    const year = matchDate.getFullYear();
    const suffix = this.getDaySuffix(day);
    const formattedDate = `${day}${suffix} ${month} ${year}`;

    // Build message
    let message = `*${formattedDate}* ${match.matchType === 'tournament' ? 'Tournament Match' : 'Practice Match'}\n`;

    if (match.matchFormat) {
      message += `*Format*: ${match.matchFormat}`;
      if (match.ballType) {
        message += ` ${match.ballType.toLowerCase()}`;
      }
      message += '\n';
    }

    message += `*Where*: ${match.groundName}`;
    if (match.groundMapLink) {
      message += ` (${match.groundMapLink})`;
    }
    message += '\n\n';

    if (match.opponentName) {
      message += `*vs*: ${match.opponentName}\n`;
    }

    if (match.dressCode) {
      message += `*Dress Code*: ${match.dressCode}\n`;
    }

    // Calculate and display match fees
    const totalFees = match.groundCost;
    const playersCount = match.selectedPlayers.length;
    message += `\n*Match Fees: Rs. ${totalFees}/${playersCount} = ${match.feePerPlayer}*\n`;

    if (match.reportingTime) {
      message += `Reporting: ${match.reportingTime}\n`;
    }

    message += '──────────────────────────────\n\n';

    // List selected players
    const sortedPlayers = match.selectedPlayers.sort((a, b) => a.position - b.position);
    sortedPlayers.forEach((player) => {
      let playerLine = `${player.position}. ${player.playerName}`;
      if (player.role) {
        playerLine += ` (${player.role})`;
      }
      message += `${playerLine}\n`;
    });

    // List waiting players
    if (match.waitingPlayers.length > 0) {
      message += '\nWaiting:\n';
      match.waitingPlayers.forEach((player, index) => {
        message += `${index + 1}) ${player.playerName}\n`;
      });
    }

    return message;
  }

  /**
   * Get day suffix (st, nd, rd, th)
   */
  private getDaySuffix(day: number): string {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  /**
   * Mark all players as paid
   */
  async markAllPaid(matchId: string): Promise<IMatch | null> {
    const match = await Match.findById(matchId);
    if (!match) return null;

    const now = new Date();

    // Mark all selected players as paid
    match.selectedPlayers.forEach((player) => {
      player.hasPaid = true;
      player.paidAmount = player.feeAmount;
      player.paidDate = now;
    });

    // Mark all waiting players as paid
    match.waitingPlayers.forEach((player) => {
      player.hasPaid = true;
      player.paidAmount = player.feeAmount;
      player.paidDate = now;
    });

    await match.save();
    return match;
  }
}
