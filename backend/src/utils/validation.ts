import Joi from 'joi';
import { UserRole, AnomalySeverity } from '../types';

// User validation schemas
export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required',
    }),
  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required',
    }),
  role: Joi.string()
    .valid(...Object.values(UserRole))
    .default(UserRole.WORKER),
  organizationId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .when('role', {
      is: Joi.valid(UserRole.WORKER, UserRole.MANAGER),
      then: Joi.required(),
      otherwise: Joi.optional(),
    })
    .messages({
      'string.pattern.base': 'Invalid organization ID format',
      'any.required': 'Organization ID is required for worker or manager roles',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required',
    }),
  password: Joi.string()
    .min(6)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),
});

// Energy data validation schemas
export const energyDataSchema = Joi.object({
  lineId: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Line ID is required',
    }),
  lineName: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Line name is required',
    }),
  consumption: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Consumption cannot be negative',
      'any.required': 'Consumption value is required',
    }),
  threshold: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Threshold cannot be negative',
      'any.required': 'Threshold is required',
    }),
  metadata: Joi.object({
    voltage: Joi.number().min(0),
    current: Joi.number().min(0),
    powerFactor: Joi.number().min(0).max(1),
    location: Joi.string().trim(),
  }).optional(),
});

// Anomaly validation schemas
export const resolveAnomalySchema = Joi.object({
  notes: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Notes cannot exceed 500 characters',
    }),
});

// Query parameter validation schemas
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

export const energyDataFiltersSchema = paginationSchema.keys({
  lineId: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  isAnomaly: Joi.boolean().optional(),
  minConsumption: Joi.number().min(0).optional(),
  maxConsumption: Joi.number().min(0).optional(),
});

export const anomalyFiltersSchema = paginationSchema.keys({
  severity: Joi.string().valid(...Object.values(AnomalySeverity)).optional(),
  resolved: Joi.boolean().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  lineId: Joi.string().optional(),
});

// File upload validation
export const fileUploadSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  encoding: Joi.string().required(),
  mimetype: Joi.string().valid(
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ).required(),
  size: Joi.number().max(10485760).required(), // 10MB
});
