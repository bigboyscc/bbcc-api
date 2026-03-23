import { Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { ApiResponse } from '@/utils/apiResponse';
import { IAuthRequest } from '@/types/auth.types';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  static async register(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await AuthService.register(validatedData);
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static async login(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  static async refreshToken(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const result = await AuthService.refreshToken(refreshToken);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  static async logout(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Authentication required');
      }

      await AuthService.logout(req.user._id.toString());
      return ApiResponse.success(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  static async getCurrentUser(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Authentication required');
      }

      const user = await AuthService.getCurrentUser(req.user._id.toString());
      return ApiResponse.success(res, {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/v1/auth/profile
   */
  static async updateProfile(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Authentication required');
      }

      const validatedData = updateProfileSchema.parse(req.body);
      const user = await AuthService.updateProfile(req.user._id.toString(), validatedData);

      return ApiResponse.success(res, {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   * PUT /api/v1/auth/password
   */
  static async changePassword(req: IAuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res, 'Authentication required');
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
      await AuthService.changePassword(req.user._id.toString(), currentPassword, newPassword);

      return ApiResponse.success(res, { message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
}
