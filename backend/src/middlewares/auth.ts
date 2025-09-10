import { Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
import { AuthenticatedRequest } from '../types/express';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { UserRole } from '../types';

/**
 * Authentication middleware
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }
    
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    next(new AuthenticationError('Invalid or expired token'));
  }
};

/**
 * Authorization middleware factory
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required'));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }
    
    next();
  };
};

/**
 * Organization access middleware
 */
export const requireOrganizationAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }
  
  // Admins have access to all organizations
  if (req.user.role === UserRole.ADMIN) {
    return next();
  }
  
  // Check if user has organization access
  const organizationId = req.params.organizationId || req.body.organizationId || req.query.organizationId;
  
  if (organizationId && req.user.organizationId !== organizationId) {
    return next(new AuthorizationError('Access denied to this organization'));
  }
  
  next();
};

/**
 * Self or admin access middleware (for user profile operations)
 */
export const requireSelfOrAdminAccess = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AuthenticationError('Authentication required'));
  }
  
  const targetUserId = req.params.userId || req.params.id;
  
  // Allow if admin or accessing own profile
  if (req.user.role === UserRole.ADMIN || req.user.userId === targetUserId) {
    return next();
  }
  
  next(new AuthorizationError('Access denied'));
};
