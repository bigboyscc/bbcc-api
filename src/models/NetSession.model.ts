import mongoose, { Schema, Document } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     NetSession:
 *       type: object
 *       required:
 *         - date
 *         - time
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *         time:
 *           type: string
 *         groundId:
 *           type: string
 *         groundName:
 *           type: string
 *         fee:
 *           type: number
 *           default: 0
 *         attendees:
 *           type: array
 *           items:
 *             type: string
 *         notes:
 *           type: string
 */

export interface INetSession extends Document {
  date: Date;
  time: string;
  groundId?: mongoose.Types.ObjectId;
  groundName?: string;
  fee: number;
  attendees: mongoose.Types.ObjectId[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NetSessionSchema = new Schema<INetSession>(
  {
    date: { type: Date, required: true },
    time: { type: String, required: true },
    groundId: { type: Schema.Types.ObjectId, ref: 'Ground' },
    groundName: { type: String, trim: true },
    fee: { type: Number, default: 0 },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
    notes: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

// Indexes
NetSessionSchema.index({ date: -1 });
NetSessionSchema.index({ groundId: 1 });

export const NetSession = mongoose.model<INetSession>('NetSession', NetSessionSchema);
