import { User, IUser } from '@/models/User.model';
import { JwtUtil } from '@/utils/jwt';
import { IAuthResponse, ILoginRequest, IRegisterRequest } from '@/types/auth.types';
import { AppError } from '@/middleware/errorHandler';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: IRegisterRequest): Promise<IAuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Create new user
    const user = await User.create({
      email: data.email,
      password: data.password,
      name: data.name,
      role: 'user' // Default role
    });

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const { accessToken, refreshToken } = JwtUtil.generateTokenPair(tokenPayload);

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  /**
   * Login user
   */
  static async login(data: ILoginRequest): Promise<IAuthResponse> {
    // Find user by email (include password field)
    const user = await User.findOne({ email: data.email }).select('+password');

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(401, 'Your account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(data.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate tokens
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const { accessToken, refreshToken } = JwtUtil.generateTokenPair(tokenPayload);

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<IAuthResponse> {
    try {
      // Verify refresh token
      const payload = JwtUtil.verifyRefreshToken(refreshToken);

      // Find user and verify refresh token matches
      const user = await User.findById(payload.userId).select('+refreshToken');

      if (!user) {
        throw new AppError(401, 'Invalid refresh token');
      }

      if (user.refreshToken !== refreshToken) {
        throw new AppError(401, 'Invalid refresh token');
      }

      if (!user.isActive) {
        throw new AppError(401, 'Your account has been deactivated');
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
      };

      const tokens = JwtUtil.generateTokenPair(tokenPayload);

      // Update refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  static async logout(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    data: { name?: string; email?: string }
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (data.name) user.name = data.name;
    if (data.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser && existingUser._id.toString() !== userId) {
        throw new AppError(409, 'Email already in use');
      }
      user.email = data.email;
    }

    await user.save();
    return user;
  }

  /**
   * Change password
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError(401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();
  }
}
