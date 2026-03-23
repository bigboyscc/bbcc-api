import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { ITokenPayload } from '@/types/auth.types';

const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

export class JwtUtil {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as ITokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): ITokenPayload {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as ITokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(payload: ITokenPayload): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }
}
