import { Request, Response, NextFunction } from 'express';
import logger from '@/config/logger';

/**
 * CSRF Protection Middleware
 * Validates CSRF tokens for state-changing operations
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF protection for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip CSRF protection for auth endpoints (they set the initial token)
  if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
    return next();
  }

  try {
    // Get CSRF token from header
    const csrfTokenFromHeader = req.headers['x-csrf-token'] as string;
    
    // Get CSRF token from cookie
    const csrfTokenFromCookie = req.cookies.csrf_token;

    // Check if both tokens exist
    if (!csrfTokenFromHeader || !csrfTokenFromCookie) {
      logger.warn('CSRF protection: Missing CSRF token', {
        path: req.path,
        method: req.method,
        hasHeader: !!csrfTokenFromHeader,
        hasCookie: !!csrfTokenFromCookie,
      });

      res.status(403).json({
        success: false,
        error: 'CSRF token missing',
        code: 'CSRF_TOKEN_MISSING',
      });
      return;
    }

    // Validate tokens match (double-submit cookie pattern)
    if (csrfTokenFromHeader !== csrfTokenFromCookie) {
      logger.warn('CSRF protection: Token mismatch', {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });

      res.status(403).json({
        success: false,
        error: 'CSRF token invalid',
        code: 'CSRF_TOKEN_INVALID',
      });
      return;
    }

    // CSRF validation passed
    next();
  } catch (error) {
    logger.error('CSRF protection error:', error);
    res.status(500).json({
      success: false,
      error: 'CSRF validation failed',
      code: 'CSRF_VALIDATION_ERROR',
    });
  }
};

/**
 * Optional CSRF protection for specific routes
 */
export const optionalCSRFProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Only apply CSRF protection if cookies are present (indicating cookie-based auth)
  if (req.cookies.access_token) {
    return csrfProtection(req, res, next);
  }
  
  // Skip CSRF protection for token-based auth
  next();
};
