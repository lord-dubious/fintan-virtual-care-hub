import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { config } from '@/config';
import { loggers } from '@/config/logger';
import { AuthenticatedRequest } from '@/types';

// Skip rate limiting for certain conditions
const skipRateLimit = (req: AuthenticatedRequest): boolean => {
  // Skip rate limiting for health checks
  if (req.path === '/health' || req.path === '/api/health') {
    return true;
  }

  // Skip rate limiting for admin users in development
  if (config.server.isDevelopment) {
    const user = req.user;
    if (user && user.role === 'ADMIN') {
      return true;
    }
  }

  return false;
};

// Default rate limit configuration
const defaultRateLimitConfig = {
  windowMs: config.security.rateLimit.windowMs, // 15 minutes
  max: config.security.rateLimit.maxRequests, // 100 requests per window
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: skipRateLimit,
  handler: (req: Request, res: Response) => {
    loggers.security.rateLimitExceeded(req.ip || 'unknown', req.originalUrl);
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
    });
  },
};

// General API rate limiter
export const apiLimiter = rateLimit({
  ...defaultRateLimitConfig,
  max: 1000, // 1000 requests per 15 minutes for general API
});

// Authentication rate limiter (stricter)
export const authLimiter = rateLimit({
  ...defaultRateLimitConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again later',
  },
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  ...defaultRateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 password reset attempts per hour
  message: {
    success: false,
    error: 'Too many password reset attempts, please try again later',
  },
});

// Registration rate limiter
export const registrationLimiter = rateLimit({
  ...defaultRateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registration attempts per hour per IP
  message: {
    success: false,
    error: 'Too many registration attempts, please try again later',
  },
});

// Payment rate limiter
export const paymentLimiter = rateLimit({
  ...defaultRateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 payment attempts per hour
  message: {
    success: false,
    error: 'Too many payment attempts, please try again later',
  },
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  ...defaultRateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 file uploads per hour
  message: {
    success: false,
    error: 'Too many file upload attempts, please try again later',
  },
});

// Consultation creation rate limiter
export const consultationLimiter = rateLimit({
  ...defaultRateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 consultation creations per hour
  message: {
    success: false,
    error: 'Too many consultation requests, please try again later',
  },
});

// Email sending rate limiter
export const emailLimiter = rateLimit({
  ...defaultRateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 emails per hour per IP
  message: {
    success: false,
    error: 'Too many email requests, please try again later',
  },
});

// SMS sending rate limiter
export const smsLimiter = rateLimit({
  ...defaultRateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 SMS per hour per IP
  message: {
    success: false,
    error: 'Too many SMS requests, please try again later',
  },
});

// Admin operations rate limiter
export const adminLimiter = rateLimit({
  ...defaultRateLimitConfig,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 200, // 200 admin operations per hour
  message: {
    success: false,
    error: 'Too many admin requests, please try again later',
  },
});

// Create custom rate limiter
export const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    ...defaultRateLimitConfig,
    ...options,
    message: {
      success: false,
      error: options.message || 'Too many requests, please try again later',
    },
  });
};

// Rate limiter for specific user (requires authentication)
export const createUserRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
}) => {
  return rateLimit({
    ...defaultRateLimitConfig,
    ...options,
    keyGenerator: (req: AuthenticatedRequest) => {
      // Use user ID if authenticated, otherwise fall back to IP
      return req.userId || req.ip || 'anonymous';
    },
    message: {
      success: false,
      error: options.message || 'Too many requests, please try again later',
    },
  });
};

// Dynamic rate limiter based on user role
export const createRoleBasedRateLimiter = (limits: {
  PATIENT?: number;
  PROVIDER?: number;
  ADMIN?: number;
  default?: number;
}) => {
  return rateLimit({
    ...defaultRateLimitConfig,
    max: (req: AuthenticatedRequest) => {
      const user = req.user;
      if (user && limits[user.role as keyof typeof limits]) {
        return limits[user.role as keyof typeof limits]!;
      }
      return limits.default || defaultRateLimitConfig.max;
    },
    keyGenerator: (req: AuthenticatedRequest) => {
      return req.userId || req.ip || 'anonymous';
    },
  });
};

// Export rate limiters object
export const rateLimiters = {
  api: apiLimiter,
  auth: authLimiter,
  passwordReset: passwordResetLimiter,
  registration: registrationLimiter,
  payment: paymentLimiter,
  upload: uploadLimiter,
  consultation: consultationLimiter,
  email: emailLimiter,
  sms: smsLimiter,
  admin: adminLimiter,
};

// Export individual functions
export { skipRateLimit };
