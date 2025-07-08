import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { prisma } from '@/config/database';
import { AuthenticatedRequest, AuthUser, JwtPayload, UserRole } from '@/types';
import logger, { loggers } from '@/config/logger';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens (supports both cookies and headers)
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Try to get token from Authorization header first (Bearer token)
    const authHeader = req.headers.authorization;
    let token = authHeader && authHeader.split(' ')[1];

    // If no header token, try to get from HTTP-only cookie
    if (!token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'TOKEN_MISSING',
      });
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.auth.jwtSecret) as JwtPayload;
    
    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    // Log successful authentication
    loggers.auth.login(user.id, user.email || '', true, req.ip);

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: 'Token expired',
      });
      return;
    }

    logger.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * Middleware to authorize specific roles
 */
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      loggers.security.suspiciousActivity(
        req.user.id,
        'unauthorized_role_access',
        { requiredRoles: roles, userRole: req.user.role, endpoint: req.path }
      );

      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user owns the resource
 */
export const authorizeOwnership = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
    
    // Admin can access any resource
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    // User can only access their own resources
    if (req.user.id !== resourceUserId) {
      loggers.security.suspiciousActivity(
        req.user.id,
        'unauthorized_resource_access',
        { resourceUserId, endpoint: req.path }
      );

      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is a patient and owns the patient resource
 */
export const authorizePatient = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const patientId = req.params['patientId'] || req.body.patientId;
    
    // Admin can access any patient resource
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    // Check if user is a patient and owns the resource
    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { userId: true },
      });

      if (!patient || patient.userId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }
    }

    // Providers can access patient resources for their appointments
    if (req.user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!provider) {
        res.status(403).json({
          success: false,
          error: 'Provider not found',
        });
        return;
      }

      // Check if provider has appointments with this patient
      const appointment = await prisma.appointment.findFirst({
        where: {
          patientId,
          providerId: provider.id,
        },
      });

      if (!appointment) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }
    }

    next();
  } catch (error) {
    logger.error('Patient authorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization failed',
    });
  }
};

/**
 * Middleware to check if user is a provider and owns the provider resource
 */
export const authorizeProvider = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const providerId = req.params['providerId'] || req.body.providerId;
    
    // Admin can access any provider resource
    if (req.user.role === 'ADMIN') {
      next();
      return;
    }

    // Check if user is a provider and owns the resource
    if (req.user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        select: { userId: true },
      });

      if (!provider || provider.userId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: 'Access denied',
        });
        return;
      }
    } else {
      res.status(403).json({
        success: false,
        error: 'Provider access required',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Provider authorization error:', error);
    res.status(500).json({
      success: false,
      error: 'Authorization failed',
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.auth.jwtSecret) as JwtPayload;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};
