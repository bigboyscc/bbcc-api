import { Response, NextFunction } from 'express';
import { User } from '@/models/User.model';
import { JwtUtil } from '@/utils/jwt';
import { IAuthRequest } from '@/types/auth.types';
import { ApiResponse } from '@/utils/apiResponse';
import { logger } from '@/config/logger';

/**
 * Authentication middleware - Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponse.unauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = JwtUtil.verifyAccessToken(token);

    // Get user from database
    const user = await User.findById(payload.userId);

    if (!user) {
      ApiResponse.unauthorized(res, 'User not found');
      return;
    }

    if (!user.isActive) {
      ApiResponse.unauthorized(res, 'User account is inactive');
      return;
    }

    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    logger.error({ error }, 'Authentication error');
    ApiResponse.unauthorized(res, 'Invalid or expired token');
  }
};

/**
 * Optional authentication - Attaches user if token is valid, but doesn't fail if not
 */
export const optionalAuthenticate = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = JwtUtil.verifyAccessToken(token);
      const user = await User.findById(payload.userId);

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silently fail - optional auth
    next();
  }
};
