import mongoose, { Schema, Document } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     MatchPlayerPayment:
 *       type: object
 *       properties:
 *         playerId:
 *           type: string
 *           description: Reference to Player
 *         playerName:
 *           type: string
 *           description: Player name for display
 *         position:
 *           type: number
 *           description: Player position/order (1-12 or 1-13)
 *         role:
 *           type: string
 *           enum: [C, WK]
 *           description: Player role - C (Captain) or WK (Wicket Keeper)
 *         feeAmount:
 *           type: number
 *           description: Fee amount for this player
 *         hasPaid:
 *           type: boolean
 *           default: false
 *           description: Whether player has paid their fee
 *         paidAmount:
 *           type: number
 *           default: 0
 *           description: Amount paid by player
 *         paidDate:
 *           type: string
 *           format: date
 *           description: Date when payment was made
 *         rebateReason:
 *           type: string
 *           description: Reason for fee rebate if applicable
 *     Match:
 *       type: object
 *       required:
 *         - matchDate
 *         - matchTime
 *         - groundId
 *         - matchType
 *       properties:
 *         matchDate:
 *           type: string
 *           format: date
 *           description: Date of the match
 *         matchTime:
 *           type: string
 *           description: Time of the match (e.g., "2:00 PM")
 *         reportingTime:
 *           type: string
 *           description: Reporting time for players (e.g., "1:45 PM")
 *         groundId:
 *           type: string
 *           description: Reference to Ground
 *         groundName:
 *           type: string
 *           description: Ground name (denormalized)
 *         groundMapLink:
 *           type: string
 *           description: Google Maps link for ground
 *         matchType:
 *           type: string
 *           enum: [practice, tournament]
 *           description: Type of match
 *         tournamentName:
 *           type: string
 *           description: Tournament name (if tournament match)
 *         opponentName:
 *           type: string
 *           description: Name of opponent team
 *         matchFormat:
 *           type: string
 *           description: Match format (e.g., "T30", "T20")
 *         ballType:
 *           type: string
 *           description: Ball type (e.g., "White Ball", "Red Ball")
 *         dressCode:
 *           type: string
 *           description: Dress code (e.g., "BigBlue Jersey")
 *         totalSlots:
 *           type: number
 *           description: Total playing slots (13 for practice, 12 for tournament)
 *         groundCost:
 *           type: number
 *           description: Total cost of the ground
 *         feePerPlayer:
 *           type: number
 *           description: Default fee amount per player
 *         selectedPlayers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MatchPlayerPayment'
 *           description: Players selected for the match
 *         waitingPlayers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MatchPlayerPayment'
 *           description: Players in waiting list
 *         totalCollected:
 *           type: number
 *           default: 0
 *           description: Total amount collected from all players
 *         totalPending:
 *           type: number
 *           default: 0
 *           description: Total pending amount
 *         status:
 *           type: string
 *           enum: [upcoming, completed, cancelled]
 *           default: upcoming
 *         notes:
 *           type: string
 *           description: Additional notes about the match
 */

interface IMatchPlayerPayment {
  playerId: mongoose.Types.ObjectId;
  playerName: string;
  position: number;
  role?: 'C' | 'WK';
  feeAmount: number;
  hasPaid: boolean;
  paidAmount: number;
  paidDate?: Date;
  rebateReason?: string;
}

export interface IMatch extends Document {
  // Basic Info
  matchDate: Date;
  matchTime: string;
  reportingTime?: string;
  groundId: mongoose.Types.ObjectId;
  groundName: string;
  groundMapLink?: string;

  // Match Type
  matchType: 'practice' | 'tournament';
  tournamentName?: string;
  opponentName?: string;
  matchFormat?: string;
  ballType?: string;
  dressCode?: string;

  // Finance
  groundCost: number;
  feePerPlayer: number;
  totalSlots: number;

  // Players
  selectedPlayers: IMatchPlayerPayment[];
  waitingPlayers: IMatchPlayerPayment[];

  // Calculated Fields
  totalCollected: number;
  totalPending: number;

  // Status
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const MatchPlayerPaymentSchema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  playerName: { type: String, required: true },
  position: { type: Number, required: true },
  role: { type: String, enum: ['C', 'WK'] },
  feeAmount: { type: Number, required: true },
  hasPaid: { type: Boolean, default: false },
  paidAmount: { type: Number, default: 0 },
  paidDate: { type: Date },
  rebateReason: { type: String, trim: true }
});

const MatchSchema = new Schema<IMatch>(
  {
    // Basic Info
    matchDate: { type: Date, required: true },
    matchTime: { type: String, required: true },
    reportingTime: { type: String },
    groundId: { type: Schema.Types.ObjectId, ref: 'Ground', required: true },
    groundName: { type: String, required: true, trim: true },
    groundMapLink: { type: String, trim: true },

    // Match Type
    matchType: { type: String, required: true, enum: ['practice', 'tournament'] },
    tournamentName: { type: String, trim: true },
    opponentName: { type: String, trim: true },
    matchFormat: { type: String, trim: true },
    ballType: { type: String, trim: true },
    dressCode: { type: String, trim: true },

    // Finance
    groundCost: { type: Number, required: true, default: 0 },
    feePerPlayer: { type: Number, required: true, default: 0 },
    totalSlots: { type: Number, required: true },

    // Players
    selectedPlayers: [MatchPlayerPaymentSchema],
    waitingPlayers: [MatchPlayerPaymentSchema],

    // Calculated Fields
    totalCollected: { type: Number, default: 0 },
    totalPending: { type: Number, default: 0 },

    // Status
    status: {
      type: String,
      enum: ['upcoming', 'completed', 'cancelled'],
      default: 'upcoming'
    },
    notes: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

// Indexes
MatchSchema.index({ matchDate: -1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ matchType: 1 });
MatchSchema.index({ groundId: 1 });

// Calculate totals before saving
MatchSchema.pre('save', function (next) {
  // Calculate total collected
  const collectedFromSelected = this.selectedPlayers.reduce(
    (sum, player) => sum + (player.hasPaid ? player.paidAmount : 0),
    0
  );
  const collectedFromWaiting = this.waitingPlayers.reduce(
    (sum, player) => sum + (player.hasPaid ? player.paidAmount : 0),
    0
  );
  this.totalCollected = collectedFromSelected + collectedFromWaiting;

  // Calculate total expected
  const expectedFromSelected = this.selectedPlayers.reduce(
    (sum, player) => sum + player.feeAmount,
    0
  );
  const expectedFromWaiting = this.waitingPlayers.reduce(
    (sum, player) => sum + player.feeAmount,
    0
  );
  const totalExpected = expectedFromSelected + expectedFromWaiting;

  // Calculate pending
  this.totalPending = totalExpected - this.totalCollected;

  next();
});

export const Match = mongoose.model<IMatch>('Match', MatchSchema);
