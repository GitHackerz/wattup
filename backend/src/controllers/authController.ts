import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/express';
import { User } from '../models/User';
import { generateToken, generateRefreshToken, generateResetToken, hashToken } from '../utils/auth';
import { successResponse } from '../utils/helpers';
import { EmailService } from '../services/email';
import { AppError, AuthenticationError, ConflictError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Authentication Controller
 */
export class AuthController {
  private emailService = EmailService.getInstance();

  /**
   * Register new user
   */
  public register = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password, firstName, lastName, role, organizationId } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      // Create new user
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role,
        organizationId,
      });

      // Generate tokens
      const tokenPayload = {
        userId: user._id!.toString(),
        email: user.email,
        role: user.role,
        organizationId: user.organizationId?.toString(),
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Send welcome email (don't block response)
      this.emailService.sendWelcomeEmail(user.email, user.firstName).catch(error => {
        logger.error('Error sending welcome email:', error);
      });

      // Log registration
      logger.info(`New user registered: ${user.email}`);

      res.status(201).json(
        successResponse(
          {
            user: {
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              organizationId: user.organizationId,
              isActive: user.isActive,
              emailVerified: user.emailVerified,
            },
            accessToken,
            refreshToken,
          },
          'User registered successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   */
  public login = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user with password field
      const user = await User.findOne({ email, isActive: true }).select('+password');
      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const tokenPayload = {
        userId: user._id!.toString(),
        email: user.email,
        role: user.role,
        organizationId: user.organizationId?.toString(),
      };

      const accessToken = generateToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Log successful login
      logger.info(`User logged in: ${user.email}`);

      res.json(
        successResponse(
          {
            user: {
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              organizationId: user.organizationId,
              isActive: user.isActive,
              emailVerified: user.emailVerified,
              lastLogin: user.lastLogin,
            },
            accessToken,
            refreshToken,
          },
          'Login successful'
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user profile
   */
  public getProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = await User.findById(req.user!.userId).populate('organizationId', 'name');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json(
        successResponse(
          {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId,
            isActive: user.isActive,
            emailVerified: user.emailVerified,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          'Profile retrieved successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   */
  public updateProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { firstName, lastName } = req.body;
      const userId = req.user!.userId;

      const user = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.json(
        successResponse(
          {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            organizationId: user.organizationId,
            updatedAt: user.updatedAt,
          },
          'Profile updated successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password
   */
  public changePassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      // Find user with password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new AuthenticationError('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      logger.info(`Password changed for user: ${user.email}`);

      res.json(successResponse(null, 'Password changed successfully'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Forgot password
   */
  public forgotPassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        // Don't reveal if user exists or not
        res.json(
          successResponse(null, 'If the email exists, a password reset link has been sent')
        );
        return;
      }

      // Generate reset token
      const resetToken = generateResetToken();
      const hashedToken = hashToken(resetToken);

      // Save reset token
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await user.save();

      // Send reset email
      const emailSent = await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName,
        resetToken
      );

      if (!emailSent) {
        throw new AppError('Error sending password reset email');
      }

      logger.info(`Password reset email sent to: ${user.email}`);

      res.json(
        successResponse(null, 'If the email exists, a password reset link has been sent')
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password
   */
  public resetPassword = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { token, password } = req.body;

      // Hash the token to compare with stored token
      const hashedToken = hashToken(token);

      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
        isActive: true,
      }).select('+resetPasswordToken +resetPasswordExpires');

      if (!user) {
        throw new AuthenticationError('Invalid or expired reset token');
      }

      // Update password and clear reset token
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      logger.info(`Password reset successful for user: ${user.email}`);

      res.json(successResponse(null, 'Password reset successful'));
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout (placeholder for client-side token removal)
   */
  public logout = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // In a stateless JWT setup, logout is typically handled client-side
      // This endpoint can be used for logging or additional cleanup if needed
      
      logger.info(`User logged out: ${req.user!.email}`);
      
      res.json(successResponse(null, 'Logout successful'));
    } catch (error) {
      next(error);
    }
  };
}
