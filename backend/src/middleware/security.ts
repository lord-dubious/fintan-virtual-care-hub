import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';

// Rate limiting configurations
export const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    error: 'Rate limit exceeded for sensitive operations.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "*"],
      styleSrc: ["'self'", "'unsafe-inline'", "*"],
      fontSrc: ["'self'", "*"],
      imgSrc: ["'self'", "data:", "https:", "http:", "*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:", "*"],
      frameSrc: ["'self'", "*"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "*"],
      manifestSrc: ["'self'", "*"],
    },
  },
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Input validation middleware
export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

export const validatePassword = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

export const validateName = body('name')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Name must be between 2 and 100 characters')
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes');

export const validatePhone = body('phone')
  .optional()
  .matches(/^\+?[\d\s\-\(\)]+$/)
  .withMessage('Please provide a valid phone number');

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
    return;
  }
  next();
};

// Sanitize input middleware
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    return str
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

// CORS configuration - Universal access by default
export const corsOptions = {
  origin: true, // Allow ALL origins universally
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-CSRF-Token'],
};

// File upload security
export const fileUploadSecurity = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: any) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'), false);
    }
  },
};

// Security audit logging
export const auditLogger = (action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      const logData = {
        timestamp: new Date().toISOString(),
        action,
        userId: (req as any).user?.id || 'anonymous',
        ip: req.ip || req.socket?.remoteAddress,
        userAgent: req.get('User-Agent'),
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        success: res.statusCode < 400,
      };

      // Log to console in development, would send to logging service in production
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Security Audit:', JSON.stringify(logData, null, 2));
      }

      return originalSend.call(this, data);
    };

    next();
  };
};

// Request size limiting
export const requestSizeLimit = (maxSize: string = '10mb') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('content-length');
    if (contentLength) {
      const sizeInBytes = parseInt(contentLength);
      const maxSizeInBytes = parseSize(maxSize);
      
      if (sizeInBytes > maxSizeInBytes) {
        res.status(413).json({
          success: false,
          error: 'Request entity too large',
        });
        return;
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

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.socket?.remoteAddress || '';
    
    if (allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied from this IP address',
      });
    }
  };
};

// Session security
export const sessionSecurity = {
  secret: process.env.SESSION_SECRET || (() => {
    throw new Error('SESSION_SECRET environment variable is required');
  })(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' as const, // CSRF protection
  },
};

export default {
  loginRateLimit,
  apiRateLimit,
  strictRateLimit,
  securityHeaders,
  validateEmail,
  validatePassword,
  validateName,
  validatePhone,
  handleValidationErrors,
  sanitizeInput,
  corsOptions,
  fileUploadSecurity,
  auditLogger,
  requestSizeLimit,
  ipWhitelist,
  sessionSecurity,
};
