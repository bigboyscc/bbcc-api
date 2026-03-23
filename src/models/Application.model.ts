import mongoose, { Schema, Document } from 'mongoose';

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *         phone:
 *           type: string
 *         city:
 *           type: string
 *         area:
 *           type: string
 *         experienceLevel:
 *           type: string
 *           enum: [new, experienced]
 *         primarySkill:
 *           type: string
 *         skillDetail:
 *           type: string
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *         notes:
 *           type: string
 */

export interface IApplication extends Document {
  name: string;
  phone: string;
  city?: string;
  area?: string;
  experienceLevel?: 'new' | 'experienced';
  primarySkill?: string;
  skillDetail?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    area: { type: String, trim: true },
    experienceLevel: { type: String, enum: ['new', 'experienced'] },
    primarySkill: { type: String, trim: true },
    skillDetail: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    notes: { type: String, trim: true }
  },
  {
    timestamps: true
  }
);

// Indexes
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
