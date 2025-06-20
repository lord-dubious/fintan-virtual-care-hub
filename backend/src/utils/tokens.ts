import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '@/config';

/**
 * Generate a secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate password reset token
 */
export const generatePasswordResetToken = (): string => {
  return generateSecureToken(32);
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (): string => {
  return generateSecureToken(64);
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (payload: any): string => {
  return jwt.sign(payload, config.auth.jwtSecret, {
    expiresIn: config.auth.jwtExpiresIn,
  } as any);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, config.auth.jwtSecret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * Hash password reset token for storage
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = (token: string, hashedToken: string): boolean => {
  const hashedInputToken = hashToken(token);
  return hashedInputToken === hashedToken;
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};

/**
 * Generate token expiration date
 */
export const generateTokenExpiration = (minutes: number = 15): Date => {
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * Generate refresh token expiration date (7 days)
 */
export const generateRefreshTokenExpiration = (): Date => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
};
