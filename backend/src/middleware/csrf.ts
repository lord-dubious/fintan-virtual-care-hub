import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '@/types';
import logger from '@/config/logger';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const CSRF_BODY_FIELD = '_csrf';

// Store for CSRF tokens (in production, use Redis)
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Create CSRF token and set cookie
 */
export function createCSRFToken(req: Request, res: Response): string {
  const token = generateCSRFToken();
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  // Store token with expiration
  const sessionId = req.sessionID || req.ip || 'anonymous';
  csrfTokenStore.set(sessionId, { token, expires });
  
  // Set secure HTTP-only cookie
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  });
  
  return token;
}

/**
 * Validate CSRF token from request
 */
function validateCSRFToken(req: Request, token: string): boolean {
  const sessionId = req.sessionID || req.ip || 'anonymous';
  const storedData = csrfTokenStore.get(sessionId);
  
  if (!storedData) {
    return false;
  }
  
  // Check if token has expired
  if (Date.now() > storedData.expires) {
    csrfTokenStore.delete(sessionId);
    return false;
  }
  
  // Use timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(storedData.token, 'hex')
  );
}

/**
 * Extract CSRF token from request
 */
function extractCSRFToken(req: Request): string | null {
  // Try header first
  let token = req.headers[CSRF_HEADER_NAME] as string;
  
  // Try body field
  if (!token && req.body && req.body[CSRF_BODY_FIELD]) {
    token = req.body[CSRF_BODY_FIELD];
  }
  
  // Try query parameter (less secure, only for GET requests)
  if (!token && req.method === 'GET' && req.query[CSRF_BODY_FIELD]) {
    token = req.query[CSRF_BODY_FIELD] as string;
  }
  
  return token || null;
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(options: {
  ignoreMethods?: string[];
  skipRoutes?: string[];
} = {}) {
  const { 
    ignoreMethods = ['GET', 'HEAD', 'OPTIONS'],
    skipRoutes = ['/api/auth/csrf-token', '/api/health']
  } = options;
  
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Skip CSRF protection for certain routes
      if (skipRoutes.some(route => req.path.startsWith(route))) {
        return next();
      }
      
      // Skip CSRF protection for safe methods
      if (ignoreMethods.includes(req.method)) {
        return next();
      }
      
      // Extract token from request
      const token = extractCSRFToken(req);
      
      if (!token) {
        logger.warn('CSRF token missing', {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });
        
        res.status(403).json({
          success: false,
          error: 'CSRF token required',
          code: 'CSRF_TOKEN_MISSING',
        });
        return;
      }
      
      // Validate token
      if (!validateCSRFToken(req, token)) {
        logger.warn('Invalid CSRF token', {
          method: req.method,
          path: req.path,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          token: token.substring(0, 8) + '...', // Log only first 8 chars
        });
        
        res.status(403).json({
          success: false,
          error: 'Invalid CSRF token',
          code: 'CSRF_TOKEN_INVALID',
        });
        return;
      }
      
      next();
    } catch (error) {
      logger.error('CSRF protection error:', error);
      res.status(500).json({
        success: false,
        error: 'CSRF protection error',
        code: 'CSRF_ERROR',
      });
    }
  };
}

/**
 * Middleware to generate and provide CSRF token
 */
export function provideCSRFToken(req: Request, res: Response, next: NextFunction): void {
  try {
    const token = createCSRFToken(req, res);
    
    // Add token to response locals for template rendering
    res.locals.csrfToken = token;
    
    // Add token to authenticated request
    if ('user' in req) {
      (req as AuthenticatedRequest).csrfToken = token;
    }
    
    next();
  } catch (error) {
    logger.error('CSRF token generation error:', error);
    next(error);
  }
}

/**
 * Get CSRF token endpoint
 */
export function getCSRFToken(req: Request, res: Response): void {
  try {
    const token = createCSRFToken(req, res);
    
    res.json({
      success: true,
      data: {
        csrfToken: token,
      },
    });
  } catch (error) {
    logger.error('CSRF token endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CSRF token',
    });
  }
}

/**
 * Clean up expired CSRF tokens
 */
export function cleanupExpiredTokens(): void {
  const now = Date.now();
  
  for (const [sessionId, data] of csrfTokenStore.entries()) {
    if (now > data.expires) {
      csrfTokenStore.delete(sessionId);
    }
  }
}

// Clean up expired tokens every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

/**
 * Double Submit Cookie pattern for additional security
 */
export function doubleSubmitCookie(req: Request, res: Response, next: NextFunction): void {
  try {
    // Skip for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }
    
    const cookieToken = req.cookies[CSRF_COOKIE_NAME];
    const headerToken = req.headers[CSRF_HEADER_NAME] as string;
    
    if (!cookieToken || !headerToken) {
      res.status(403).json({
        success: false,
        error: 'CSRF tokens required',
        code: 'CSRF_DOUBLE_SUBMIT_MISSING',
      });
      return;
    }
    
    // Verify tokens match
    if (!crypto.timingSafeEqual(
      Buffer.from(cookieToken, 'hex'),
      Buffer.from(headerToken, 'hex')
    )) {
      res.status(403).json({
        success: false,
        error: 'CSRF token mismatch',
        code: 'CSRF_DOUBLE_SUBMIT_MISMATCH',
      });
      return;
    }
    
    next();
  } catch (error) {
    logger.error('Double submit cookie error:', error);
    res.status(500).json({
      success: false,
      error: 'CSRF validation error',
    });
  }
}

export default {
  csrfProtection,
  provideCSRFToken,
  getCSRFToken,
  doubleSubmitCookie,
  createCSRFToken,
  cleanupExpiredTokens,
};
