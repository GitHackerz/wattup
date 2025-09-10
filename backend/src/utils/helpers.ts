import { ApiResponse, PaginationQuery } from '../types';

/**
 * Create success response
 */
export const successResponse = <T>(
  data?: T,
  message?: string,
  pagination?: ApiResponse['pagination']
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success: true,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return response;
};

/**
 * Create error response
 */
export const errorResponse = (
  message: string,
  error?: string
): ApiResponse => {
  return {
    success: false,
    message,
    error,
  };
};

/**
 * Calculate pagination metadata
 */
export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
  };
};

/**
 * Parse pagination query parameters
 */
export const parsePaginationQuery = (query: any): Required<PaginationQuery> => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  return { page, limit, sortBy, sortOrder };
};

/**
 * Create MongoDB sort object
 */
export const createSortObject = (sortBy: string, sortOrder: 'asc' | 'desc'): Record<string, 1 | -1> => {
  return { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
};

/**
 * Sanitize object by removing undefined values
 */
export const sanitizeObject = (obj: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Create date range filter for MongoDB queries
 */
export const createDateRangeFilter = (startDate?: Date, endDate?: Date) => {
  const filter: any = {};
  
  if (startDate || endDate) {
    filter.timestamp = {};
    
    if (startDate) {
      filter.timestamp.$gte = startDate;
    }
    
    if (endDate) {
      filter.timestamp.$lte = endDate;
    }
  }
  
  return filter;
};

/**
 * Escape regex special characters
 */
export const escapeRegex = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Create case-insensitive regex for search
 */
export const createSearchRegex = (searchTerm: string) => {
  return new RegExp(escapeRegex(searchTerm), 'i');
};
