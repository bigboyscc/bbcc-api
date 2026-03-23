import { Request, Response, NextFunction } from 'express';
import { Ground } from '@/models/Ground.model';
import { ApiResponse } from '@/utils/apiResponse';
import { z } from 'zod';

// Validation schemas
const ownerContactSchema = z.object({
  name: z.string().min(1, 'Contact name is required'),
  phone: z.string().min(1, 'Phone number is required'),
  role: z.string().optional()
});

const mapLocationSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional()
});

const createGroundSchema = z.object({
  name: z.string().min(1, 'Ground name is required'),
  pitchType: z.enum(['turf', 'astro', 'mat'], {
    errorMap: () => ({ message: 'Pitch type must be turf, astro, or mat' })
  }),
  groundCondition: z.enum(['lush_green', 'green_cover', 'semi_green', 'mud'], {
    errorMap: () => ({
      message: 'Ground condition must be lush_green, green_cover, semi_green, or mud'
    })
  }),
  mapLocation: mapLocationSchema.optional(),
  ownerContacts: z.array(ownerContactSchema).optional().default([]),
  facilities: z.array(z.string()).optional().default([]),
  bigBoysRating: z.number().min(0).max(5).optional(),
  costPerMatch: z.number().min(0).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional()
});

const updateGroundSchema = z.object({
  name: z.string().min(1).optional(),
  pitchType: z.enum(['turf', 'astro', 'mat']).optional(),
  groundCondition: z.enum(['lush_green', 'green_cover', 'semi_green', 'mud']).optional(),
  mapLocation: mapLocationSchema.optional(),
  ownerContacts: z.array(ownerContactSchema).optional(),
  facilities: z.array(z.string()).optional(),
  bigBoysRating: z.number().min(0).max(5).optional(),
  costPerMatch: z.number().min(0).optional(),
  notes: z.string().optional(),
  isActive: z.boolean().optional()
});

export class GroundController {
  /**
   * Get all grounds
   * GET /api/v1/grounds
   */
  static async getAllGrounds(req: Request, res: Response, next: NextFunction) {
    try {
      const { pitchType, isActive } = req.query;

      // Build filter object
      const filter: any = {};
      if (pitchType) {
        filter.pitchType = pitchType;
      }
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      const grounds = await Ground.find(filter).sort({ name: 1 });
      return ApiResponse.success(res, grounds);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single ground by ID
   * GET /api/v1/grounds/:id
   */
  static async getGroundById(req: Request, res: Response, next: NextFunction) {
    try {
      const ground = await Ground.findById(req.params.id);

      if (!ground) {
        return ApiResponse.notFound(res, 'Ground not found');
      }

      return ApiResponse.success(res, ground);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new ground
   * POST /api/v1/grounds
   */
  static async createGround(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createGroundSchema.parse(req.body);
      const ground = await Ground.create(validatedData);
      return ApiResponse.created(res, ground);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update ground
   * PUT /api/v1/grounds/:id
   */
  static async updateGround(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateGroundSchema.parse(req.body);

      const ground = await Ground.findByIdAndUpdate(req.params.id, validatedData, {
        new: true,
        runValidators: true
      });

      if (!ground) {
        return ApiResponse.notFound(res, 'Ground not found');
      }

      return ApiResponse.success(res, ground);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete ground (soft delete)
   * DELETE /api/v1/grounds/:id
   */
  static async deleteGround(req: Request, res: Response, next: NextFunction) {
    try {
      // Soft delete by setting isActive to false
      const ground = await Ground.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!ground) {
        return ApiResponse.notFound(res, 'Ground not found');
      }

      return ApiResponse.success(res, {
        message: 'Ground deleted successfully',
        ground
      });
    } catch (error) {
      next(error);
    }
  }
}
