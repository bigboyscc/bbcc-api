import { Response, NextFunction } from 'express';
import { IAuthRequest } from '@/types/auth.types';
import { ApiResponse } from '@/utils/apiResponse';

/**
 * Authorization middleware - Checks if user has required role
 * Must be used after authenticate middleware
 */
export const authorize = (...allowedRoles: Array<'admin' | 'user'>) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      ApiResponse.forbidden(res, 'Insufficient permissions');
      return;
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const adminOnly = authorize('admin');

/**
 * Check if user is accessing their own resource or is admin
 */
export const ownerOrAdmin = (userIdParam = 'id') => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponse.unauthorized(res, 'Authentication required');
      return;
    }

    const resourceUserId = req.params[userIdParam];
    const isOwner = req.user._id.toString() === resourceUserId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      ApiResponse.forbidden(res, 'You can only access your own resources');
      return;
    }

    next();
  };
};
