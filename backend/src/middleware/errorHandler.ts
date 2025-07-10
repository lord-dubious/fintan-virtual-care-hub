import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import logger, { loggers } from '@/config/logger';
import { config } from '@/config';
import { ApiError, ApiResponse, AuthenticatedRequest } from '@/types';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error response helper
const sendErrorResponse = (res: Response, error: ApiError): void => {
  const response: ApiResponse = {
    success: false,
    error: error.message,
  };

  // Include error code in development
  if (config.server.isDevelopment) {
    (response as any).debug = {
      code: error.code,
      ...(error.details && { details: error.details }),
    };
  }

  res.status(error.statusCode).json(response);
};

// Handle Prisma errors
const handlePrismaError = (error: Prisma.PrismaClientKnownRequestError): ApiError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.['target'] as string[] | undefined;
      const fieldName = field?.[0] || 'field';
      return {
        code: 'DUPLICATE_ENTRY',
        message: `${fieldName} already exists`,
        statusCode: 409,
        details: { field: fieldName },
      };

    case 'P2025':
      // Record not found
      return {
        code: 'NOT_FOUND',
        message: 'Record not found',
        statusCode: 404,
      };

    case 'P2003':
      // Foreign key constraint violation
      return {
        code: 'INVALID_REFERENCE',
        message: 'Invalid reference to related record',
        statusCode: 400,
        details: { field: error.meta?.['field_name'] },
      };

    case 'P2014':
      // Required relation violation
      return {
        code: 'MISSING_RELATION',
        message: 'Required relation is missing',
        statusCode: 400,
      };

    case 'P2021':
      // Table does not exist
      return {
        code: 'DATABASE_ERROR',
        message: 'Database table not found',
        statusCode: 500,
      };

    case 'P2022':
      // Column does not exist
      return {
        code: 'DATABASE_ERROR',
        message: 'Database column not found',
        statusCode: 500,
      };

    default:
      logger.error('Unhandled Prisma error:', { code: error.code, message: error.message });
      return {
        code: 'DATABASE_ERROR',
        message: 'Database operation failed',
        statusCode: 500,
        details: config.server.isDevelopment ? { prismaCode: error.code } : undefined,
      };
  }
};

// Handle Zod validation errors
const handleZodError = (error: ZodError): ApiError => {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    statusCode: 400,
    details: { errors },
  };
};

// Handle JWT errors
const handleJWTError = (error: Error): ApiError => {
  if (error.name === 'JsonWebTokenError') {
    return {
      code: 'INVALID_TOKEN',
      message: 'Invalid authentication token',
      statusCode: 401,
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired',
      statusCode: 401,
    };
  }

  return {
    code: 'AUTH_ERROR',
    message: 'Authentication failed',
    statusCode: 401,
  };
};

// Handle multer errors (file upload)
const handleMulterError = (error: any): ApiError => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return {
      code: 'FILE_TOO_LARGE',
      message: 'File size exceeds the maximum allowed limit',
      statusCode: 413,
    };
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return {
      code: 'TOO_MANY_FILES',
      message: 'Too many files uploaded',
      statusCode: 413,
    };
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return {
      code: 'UNEXPECTED_FILE',
      message: 'Unexpected file field',
      statusCode: 400,
    };
  }

  return {
    code: 'UPLOAD_ERROR',
    message: 'File upload failed',
    statusCode: 400,
  };
};

// Main error handling middleware
export const errorHandler = (
  error: Error,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  let apiError: ApiError;

  // Log the error
  loggers.api.error(req.method, req.originalUrl, error.message, req.userId);

  // Handle different types of errors
  if (error instanceof AppError) {
    apiError = {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    apiError = handlePrismaError(error);
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    apiError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid data provided',
      statusCode: 400,
    };
  } else if (error instanceof ZodError) {
    apiError = handleZodError(error);
  } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    apiError = handleJWTError(error);
  } else if (error.name === 'MulterError') {
    apiError = handleMulterError(error);
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    apiError = {
      code: 'INVALID_JSON',
      message: 'Invalid JSON in request body',
      statusCode: 400,
    };
  } else {
    // Generic error
    logger.error('Unhandled error:', error);
    apiError = {
      code: 'INTERNAL_ERROR',
      message: config.server.isDevelopment ? error.message : 'Internal server error',
      statusCode: 500,
    };
  }

  sendErrorResponse(res, apiError);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  const apiError: ApiError = {
    code: 'NOT_FOUND',
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  };

  sendErrorResponse(res, apiError);
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Validation error helper
export const createValidationError = (message: string, field?: string): AppError => {
  const error = new AppError(message, 400, 'VALIDATION_ERROR');
  if (field) {
    (error as any).details = { field };
  }
  return error;
};

// Not found error helper
export const createNotFoundError = (resource: string = 'Resource'): AppError => {
  return new AppError(`${resource} not found`, 404, 'NOT_FOUND');
};

// Forbidden error helper
export const createForbiddenError = (message: string = 'Access denied'): AppError => {
  return new AppError(message, 403, 'FORBIDDEN');
};

// Unauthorized error helper
export const createUnauthorizedError = (message: string = 'Authentication required'): AppError => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

// Conflict error helper
export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409, 'CONFLICT');
};

// AppError is already exported above
