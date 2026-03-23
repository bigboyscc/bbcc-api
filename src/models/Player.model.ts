import mongoose, { Schema, Document } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Player:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           description: Player's full name
 *         phone:
 *           type: string
 *           description: Player's phone number
 *         jerseyNumber:
 *           type: number
 *           description: Player's jersey number
 *         cricheroesProfile:
 *           type: string
 *           description: Cricheroes profile URL
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether player is currently active
 *         isCaptain:
 *           type: boolean
 *           default: false
 *           description: Whether player can be marked as captain
 *         isWicketKeeper:
 *           type: boolean
 *           default: false
 *           description: Whether player is a wicket keeper
 *         notes:
 *           type: string
 *           description: Additional notes about the player
 */

export interface IPlayer extends Document {
  name: string;
  phone: string;
  jerseyNumber?: number;
  cricheroesProfile?: string;
  isActive: boolean;
  isCaptain: boolean;
  isWicketKeeper: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    jerseyNumber: { type: Number, unique: true, sparse: true },
    cricheroesProfile: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    isCaptain: { type: Boolean, default: false },
    isWicketKeeper: { type: Boolean, default: false },
    notes: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

// Indexes
PlayerSchema.index({ name: 1 });
PlayerSchema.index({ phone: 1 });
PlayerSchema.index({ jerseyNumber: 1 });
PlayerSchema.index({ isActive: 1 });

export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
