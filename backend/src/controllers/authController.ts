import { Request, Response } from 'express';
import * as bcrypt from 'bcryptjs';
// import * as jwt from 'jsonwebtoken'; // Unused import
import * as crypto from 'crypto';
import { prisma } from '@/config/database';
import { config } from '@/config';
import logger, { loggers } from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import {
  generatePasswordResetToken,
  generateRefreshToken,
  generateAccessToken,
  hashToken,
  // verifyPasswordResetToken, // Unused import
  isTokenExpired,
  generateTokenExpiration,
  generateRefreshTokenExpiration
} from '@/utils/tokens';
import { emailService } from '@/services/emailService';

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: config.server.isProduction,
  sameSite: config.server.isProduction ? 'strict' as const : 'lax' as const,
  path: '/',
};

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';
const CSRF_TOKEN_COOKIE = 'csrf_token';

// CSRF token generation
const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role = 'PATIENT' } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this email already exists',
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate refresh token
    const refreshTokenValue = generateRefreshToken();
    const refreshTokenExpiresAt = generateRefreshTokenExpiration();

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(user.email!, user.name!);

    // Generate CSRF token
    const csrfToken = generateCSRFToken();

    // Set HTTP-only cookies
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshTokenValue, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set CSRF token (not httpOnly so frontend can read it)
    res.cookie(CSRF_TOKEN_COOKIE, csrfToken, {
      secure: config.server.isProduction,
      sameSite: config.server.isProduction ? 'strict' as const : 'lax' as const,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Log successful registration
    loggers.auth.register(user.id, user.email!, user.role);

    res.status(201).json({
      success: true,
      data: {
        user,
        csrfToken, // Send CSRF token in response for initial setup
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    logger.info(`🔐 Login attempt for: ${email}`);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        profilePicture: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn(`❌ Login failed - user not found: ${email}`);
      loggers.auth.login('unknown', email, false, req.ip);
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    logger.info(`👤 User found: ${user.name} (${user.role})`);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      logger.warn(`❌ Login failed - invalid password for: ${email}`);
      loggers.auth.login(user.id, email, false, req.ip);
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    logger.info(`✅ Password verified for: ${email}`);

    // Generate access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Generate refresh token
    const refreshTokenValue = generateRefreshToken();
    const refreshTokenExpiresAt = generateRefreshTokenExpiration();

    // Store refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenValue,
        userId: user.id,
        expiresAt: refreshTokenExpiresAt,
      },
    });

    // Generate CSRF token
    const csrfToken = generateCSRFToken();

    // Set HTTP-only cookies
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshTokenValue, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set CSRF token (not httpOnly so frontend can read it)
    res.cookie(CSRF_TOKEN_COOKIE, csrfToken, {
      secure: config.server.isProduction,
      sameSite: config.server.isProduction ? 'strict' as const : 'lax' as const,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Log successful login
    loggers.auth.login(user.id, email, true, req.ip);

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        csrfToken, // Send CSRF token in response for initial setup
      },
      message: 'Login successful',
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Clear HTTP-only cookies
    res.clearCookie(ACCESS_TOKEN_COOKIE, COOKIE_OPTIONS);
    res.clearCookie(REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS);
    res.clearCookie(CSRF_TOKEN_COOKIE, {
      secure: config.server.isProduction,
      sameSite: config.server.isProduction ? 'strict' as const : 'lax' as const,
      path: '/',
    });

    // Invalidate refresh token in database if user is authenticated
    if (req.user) {
      await prisma.refreshToken.deleteMany({
        where: { userId: req.user.id },
      });
      loggers.auth.logout(req.user.id);
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed',
    });
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    res.json({
      success: true,
      data: { user: req.user },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile',
    });
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: 'Email is required',
      });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken();
    const hashedToken = hashToken(resetToken);
    const expiresAt = generateTokenExpiration(15); // 15 minutes

    // Save reset token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: hashedToken,
        passwordResetExpires: expiresAt,
      },
    });

    // Send password reset email
    const emailSent = await emailService.sendPasswordResetEmail(
      user.email!,
      resetToken,
      user.name || undefined
    );

    if (!emailSent) {
      logger.error('Failed to send password reset email:', { email: user.email });
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
    });
  }
};

/**
 * Reset password
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        error: 'Token and password are required',
      });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
      return;
    }

    // Hash the provided token
    const hashedToken = hashToken(token);

    // Find user with matching reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
      return;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Invalidate all existing refresh tokens for security
    await prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
    });
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
      return;
    }

    // Find refresh token in database
    const refreshTokenRecord = await prisma.refreshToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!refreshTokenRecord) {
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
      });
      return;
    }

    // Check if token is expired
    if (isTokenExpired(refreshTokenRecord.expiresAt)) {
      // Delete expired token
      await prisma.refreshToken.delete({
        where: { id: refreshTokenRecord.id },
      });

      res.status(401).json({
        success: false,
        error: 'Refresh token has expired',
      });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: refreshTokenRecord.user.id,
      email: refreshTokenRecord.user.email,
      role: refreshTokenRecord.user.role,
    });

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken();
    const newExpiresAt = generateRefreshTokenExpiration();

    // Update refresh token in database
    await prisma.refreshToken.update({
      where: { id: refreshTokenRecord.id },
      data: {
        token: newRefreshToken,
        expiresAt: newExpiresAt,
      },
    });

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        user: refreshTokenRecord.user,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token',
    });
  }
};

/**
 * Set authentication cookies
 * POST /api/auth/set-cookies
 */
export const setCookies = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token, refreshToken } = req.body;

    if (!token || !refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Token and refresh token are required',
      });
      return;
    }

    // Generate CSRF token
    const csrfToken = generateCSRFToken();

    // Set HTTP-only cookies
    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Set CSRF token
    res.cookie(CSRF_TOKEN_COOKIE, csrfToken, {
      secure: config.server.isProduction,
      sameSite: config.server.isProduction ? 'strict' as const : 'lax' as const,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      success: true,
      data: { csrfToken },
      message: 'Cookies set successfully',
    });
  } catch (error) {
    logger.error('Set cookies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set cookies',
    });
  }
};

/**
 * Get CSRF token
 * GET /api/auth/csrf-token
 */
export const getCSRFToken = async (_req: Request, res: Response): Promise<void> => {
  try {
    const csrfToken = generateCSRFToken();

    // Set CSRF token cookie
    res.cookie(CSRF_TOKEN_COOKIE, csrfToken, {
      secure: config.server.isProduction,
      sameSite: config.server.isProduction ? 'strict' as const : 'lax' as const,
      path: '/',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      success: true,
      data: { csrfToken },
      message: 'CSRF token generated',
    });
  } catch (error) {
    logger.error('CSRF token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate CSRF token',
    });
  }
};
