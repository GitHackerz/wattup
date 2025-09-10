import { Request, Response, NextFunction } from 'express';
import { AuthTokenPayload } from './index';

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  keyValue?: Record<string, any>;
  errors?: Record<string, any>;
}

export type AsyncHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export interface SocketData {
  userId?: string;
  organizationId?: string;
  role?: string;
}

export interface RealTimeUpdate {
  type: 'energy_data' | 'anomaly' | 'system_status';
  data: any;
  timestamp: Date;
  organizationId?: string;
}
