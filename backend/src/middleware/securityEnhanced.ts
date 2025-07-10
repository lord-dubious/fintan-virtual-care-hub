import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import { sanitizeRequestBody, sanitizeUserInput, validateFileUpload, ALLOWED_FILE_TYPES, MAX_FILE_SIZES } from '@/utils/sanitization';
import { csrfProtection, provideCSRFToken } from '@/middleware/csrf';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';

// Enhanced rate limiting with different tiers
export const enhancedRateLimiting = {
  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: {
      success: false,
      error: 'Too many authentication attempts. Please try again later.',
      code: 'RATE_LIMIT_AUTH',
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests
    skipSuccessfulRequests: true,
    // Custom key generator for better tracking
    keyGenerator: (req) => {
      return `${req.ip}:${req.headers['user-agent']}`;
    },
  }),

  // API rate limiting with burst allowance
  api: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      success: false,
      error: 'Too many API requests. Please slow down.',
      code: 'RATE_LIMIT_API',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // File upload rate limiting
  upload: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: {
      success: false,
      error: 'Too many file uploads. Please try again later.',
      code: 'RATE_LIMIT_UPLOAD',
    },
  }),

  // Password reset rate limiting
  passwordReset: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset attempts per hour
    message: {
      success: false,
      error: 'Too many password reset attempts. Please try again later.',
      code: 'RATE_LIMIT_PASSWORD_RESET',
    },
  }),
};

// Enhanced security headers
export const enhancedSecurityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind CSS
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdn.jsdelivr.net"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:", // Allow HTTPS images
        "blob:" // Allow blob URLs for file uploads
      ],
      scriptSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://checkout.stripe.com",
        ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])
      ],
      connectSrc: [
        "'self'",
        "https:",
        "wss:",
        "https://api.stripe.com",
        "https://api.daily.co",
        ...(process.env.NODE_ENV === 'development' ? ["ws:", "http:"] : [])
      ],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://hooks.stripe.com",
        "https://call.daily.co"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:", "https:"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'", "blob:"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  // Additional security headers
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: false,
});

// Enhanced input validation
export const enhancedValidation = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .custom((value) => {
      const sanitized = sanitizeUserInput(value);
      if (sanitized !== value) {
        throw new Error('Invalid characters in email');
      }
      return true;
    })
    .withMessage('Please provide a valid email address'),

  password: body('password')
    .isLength({ min: 12 }) // Increased from 8 to 12
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 12 characters and contain uppercase, lowercase, number, and special character'),

  name: body('name')
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-zA-Z\s'-]+$/)
    .custom((value) => {
      const sanitized = sanitizeUserInput(value);
      if (sanitized !== value) {
        throw new Error('Invalid characters in name');
      }
      return true;
    })
    .withMessage('Name must contain only letters, spaces, hyphens, and apostrophes'),

  phone: body('phone')
    .optional()
    .matches(/^\+?[\d\s\-\(\)]+$/)
    .isLength({ max: 20 })
    .withMessage('Please provide a valid phone number'),
};

// Request sanitization middleware
export const requestSanitization = (allowHtml = false) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Sanitize request body
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeRequestBody(allowHtml)(req, res, () => {});
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === 'object') {
        for (const [key, value] of Object.entries(req.query)) {
          if (typeof value === 'string') {
            req.query[key] = sanitizeUserInput(value);
          }
        }
      }

      // Sanitize URL parameters
      if (req.params && typeof req.params === 'object') {
        for (const [key, value] of Object.entries(req.params)) {
          if (typeof value === 'string') {
            req.params[key] = sanitizeUserInput(value);
          }
        }
      }

      next();
    } catch (error) {
      logger.error('Request sanitization error:', error);
      res.status(400).json({
        success: false,
        error: 'Invalid request data',
        code: 'SANITIZATION_ERROR',
      });
    }
  };
};

// File upload security middleware
export const secureFileUpload = (fileType: 'image' | 'document' | 'medical') => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file && !req.files) {
        return next();
      }

      const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
      const allowedTypes = ALLOWED_FILE_TYPES[fileType];
      const maxSize = MAX_FILE_SIZES[fileType];

      for (const file of files) {
        if (file) {
          const validation = validateFileUpload(file, allowedTypes, maxSize);
          if (!validation.isValid) {
            return res.status(400).json({
              success: false,
              error: validation.error,
              code: 'FILE_VALIDATION_ERROR',
            });
          }
        }
      }

      next();
    } catch (error) {
      logger.error('File upload security error:', error);
      res.status(500).json({
        success: false,
        error: 'File upload security check failed',
        code: 'FILE_SECURITY_ERROR',
      });
    }
  };
};

// Request size limiting
export const requestSizeLimit = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength);
      const maxSizeInBytes = parseSize(maxSize);
      
      if (sizeInBytes > maxSizeInBytes) {
        return res.status(413).json({
          success: false,
          error: `Request size ${sizeInBytes} exceeds maximum allowed size ${maxSizeInBytes}`,
          code: 'REQUEST_TOO_LARGE',
        });
      }
    }
    
    next();
  };
};

// Helper function to parse size strings
function parseSize(size: string): number {
  const units: { [key: string]: number } = {
    b: 1,
    kb: 1024,
    mb: 1024 * 1024,
    gb: 1024 * 1024 * 1024,
  };

  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  const unit = match[2] || 'b';
  
  return value * units[unit];
}

// Security audit logging
export const securityAuditLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log security-relevant events
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log failed authentication attempts
    if (res.statusCode === 401 || res.statusCode === 403) {
      logger.warn('Security event', {
        type: 'authentication_failure',
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        statusCode: res.statusCode,
        duration,
      });
    }
    
    // Log suspicious activity
    if (res.statusCode === 429) {
      logger.warn('Security event', {
        type: 'rate_limit_exceeded',
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        duration,
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Comprehensive security middleware stack
export const securityStack = [
  enhancedSecurityHeaders,
  requestSizeLimit('10mb'),
  requestSanitization(false),
  securityAuditLogger,
  provideCSRFToken,
  csrfProtection(),
];

export default {
  enhancedRateLimiting,
  enhancedSecurityHeaders,
  enhancedValidation,
  requestSanitization,
  secureFileUpload,
  requestSizeLimit,
  securityAuditLogger,
  securityStack,
};
