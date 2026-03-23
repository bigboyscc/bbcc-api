import mongoose, { Schema, Document } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     OwnerContact:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           description: Owner/contact person name
 *         phone:
 *           type: string
 *           description: Contact phone number
 *     Ground:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ground name
 *         address:
 *           type: string
 *           description: Ground address/location
 *         mapLink:
 *           type: string
 *           description: Google Maps link
 *         ownerContacts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/OwnerContact'
 *           description: Array of owner/contact person details
 *         typicalCost:
 *           type: number
 *           description: Typical cost per match in rupees
 *         isActive:
 *           type: boolean
 *           default: true
 *           description: Whether ground is currently bookable
 *         notes:
 *           type: string
 *           description: Additional notes about the ground
 */

interface IOwnerContact {
  name: string;
  phone: string;
}

export interface IGround extends Document {
  name: string;
  address?: string;
  mapLink?: string;
  ownerContacts: IOwnerContact[];
  typicalCost?: number;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OwnerContactSchema = new Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true }
});

const GroundSchema = new Schema<IGround>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    mapLink: { type: String, trim: true },
    ownerContacts: [OwnerContactSchema],
    typicalCost: { type: Number, min: 0 },
    isActive: { type: Boolean, default: true },
    notes: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

// Index for searching
GroundSchema.index({ name: 1 });
GroundSchema.index({ isActive: 1 });

export const Ground = mongoose.model<IGround>('Ground', GroundSchema);
