import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config';
import { AuthTokenPayload } from '../types';

/**
 * Generate JWT token
 */
export const generateToken = (payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.secret as string, {
    expiresIn: '7d',
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, config.jwt.refreshSecret as string, {
    expiresIn: '30d',
  });
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): AuthTokenPayload => {
  try {
    return jwt.verify(token, config.jwt.secret as string) as AuthTokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret as string) as AuthTokenPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Generate random token for password reset
 */
export const generateResetToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash token (for storing reset tokens)
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
