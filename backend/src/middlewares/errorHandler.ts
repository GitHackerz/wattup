import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/helpers';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  // Pull out any extra details (e.g., validation details) for logging
  const extra = (err && err.details) || (err && err.keyValue) || undefined;

  logger.error('Error:', Object.assign({
    message: err && err.message,
    stack: err && err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  }, extra ? { details: extra } : {}));

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Invalid resource ID format';
    error = new AppError(message, 400);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    // err.keyValue may be undefined in some cases, guard against it
    const keyValue = err.keyValue || {};
    const field = Object.keys(keyValue)[0] || 'field';
    const message = `${field} already exists`;
    error = new AppError(message, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    // err.errors may be undefined or not an object; guard and build a readable message
    const validationErrors = err.errors && typeof err.errors === 'object' ? err.errors : {};
    const message = Object.values(validationErrors)
      .map((val: any) => (val && val.message) || (typeof val === 'string' ? val : JSON.stringify(val)))
      .join(', ');
    error = new AppError(message || 'Validation failed', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401);
  }

  // Send error response
  const responsePayload = errorResponse(
    error.message || 'Internal server error',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );

  // If validation details exist, include them in development responses
  if (process.env.NODE_ENV !== 'production') {
    const details = (error as any).details || (err && err.details);
    if (details) {
      (responsePayload as any).validation = details;
    }
  }

  res.status(error.statusCode || 500).json(responsePayload);
};

/**
 * Handle 404 errors
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
