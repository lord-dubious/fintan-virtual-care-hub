import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { prisma } from '@/config/database';
import logger from '@/config/logger';

// Token refresh state management
interface RefreshState {
  promise: Promise<string | null>;
  timestamp: number;
}

// Store for managing concurrent refresh requests
const refreshStates = new Map<string, RefreshState>();

// Cleanup interval for expired refresh states
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
const STATE_EXPIRY = 2 * 60 * 1000; // 2 minutes

/**
 * Generate a unique key for the refresh state
 */
function getRefreshKey(userId: string, tokenId?: string): string {
  return `${userId}:${tokenId || 'default'}`;
}

/**
 * Clean up expired refresh states
 */
function cleanupExpiredStates(): void {
  const now = Date.now();
  
  for (const [key, state] of refreshStates.entries()) {
    if (now - state.timestamp > STATE_EXPIRY) {
      refreshStates.delete(key);
    }
  }
}

// Start cleanup interval
setInterval(cleanupExpiredStates, CLEANUP_INTERVAL);

/**
 * Thread-safe token refresh with single-flight pattern
 */
export class TokenRefreshManager {
  /**
   * Refresh access token with race condition protection
   */
  static async refreshAccessToken(
    refreshToken: string,
    userId?: string
  ): Promise<string | null> {
    try {
      // Verify refresh token first
      const decoded = jwt.verify(refreshToken, config.auth.jwtRefreshSecret) as any;
      const tokenUserId = userId || decoded.userId;
      
      if (!tokenUserId) {
        throw new Error('Invalid refresh token: missing user ID');
      }
      
      const refreshKey = getRefreshKey(tokenUserId, decoded.jti);
      
      // Check if refresh is already in progress
      const existingState = refreshStates.get(refreshKey);
      if (existingState) {
        logger.info(`Token refresh already in progress for user ${tokenUserId}`);
        return await existingState.promise;
      }
      
      // Create new refresh promise
      const refreshPromise = this.performTokenRefresh(refreshToken, tokenUserId);
      
      // Store the promise to prevent concurrent refreshes
      refreshStates.set(refreshKey, {
        promise: refreshPromise,
        timestamp: Date.now(),
      });
      
      try {
        const result = await refreshPromise;
        return result;
      } finally {
        // Clean up the state after completion
        refreshStates.delete(refreshKey);
      }
      
    } catch (error) {
      logger.error('Token refresh error:', error);
      return null;
    }
  }
  
  /**
   * Perform the actual token refresh
   */
  private static async performTokenRefresh(
    refreshToken: string,
    userId: string
  ): Promise<string | null> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.auth.jwtRefreshSecret) as any;
      
      // Check if user exists and refresh token is valid
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          refreshTokens: {
            where: {
              token: refreshToken,
              expiresAt: {
                gt: new Date(),
              },
            },
          },
        },
      });
      
      if (!user || user.refreshTokens.length === 0) {
        logger.warn(`Invalid refresh token for user ${userId}`);
        return null;
      }
      
      // Generate new access token
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        config.auth.jwtSecret,
        {
          expiresIn: config.auth.jwtExpiresIn,
          issuer: config.auth.issuer,
          audience: config.auth.audience,
        }
      );
      
      // Update refresh token last used timestamp
      await prisma.refreshToken.update({
        where: {
          id: user.refreshTokens[0].id,
        },
        data: {
          lastUsedAt: new Date(),
        },
      });
      
      logger.info(`Access token refreshed for user ${userId}`);
      return newAccessToken;
      
    } catch (error) {
      logger.error('Token refresh performance error:', error);
      return null;
    }
  }
  
  /**
   * Revoke refresh token
   */
  static async revokeRefreshToken(refreshToken: string): Promise<boolean> {
    try {
      const decoded = jwt.verify(refreshToken, config.auth.jwtRefreshSecret) as any;
      
      await prisma.refreshToken.deleteMany({
        where: {
          token: refreshToken,
          userId: decoded.userId,
        },
      });
      
      // Clear any pending refresh states for this user
      const refreshKey = getRefreshKey(decoded.userId, decoded.jti);
      refreshStates.delete(refreshKey);
      
      logger.info(`Refresh token revoked for user ${decoded.userId}`);
      return true;
      
    } catch (error) {
      logger.error('Token revocation error:', error);
      return false;
    }
  }
  
  /**
   * Revoke all refresh tokens for a user
   */
  static async revokeAllUserTokens(userId: string): Promise<boolean> {
    try {
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });
      
      // Clear all pending refresh states for this user
      for (const [key] of refreshStates.entries()) {
        if (key.startsWith(`${userId}:`)) {
          refreshStates.delete(key);
        }
      }
      
      logger.info(`All refresh tokens revoked for user ${userId}`);
      return true;
      
    } catch (error) {
      logger.error('All tokens revocation error:', error);
      return false;
    }
  }
  
  /**
   * Clean up expired refresh tokens from database
   */
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      
      if (result.count > 0) {
        logger.info(`Cleaned up ${result.count} expired refresh tokens`);
      }
      
    } catch (error) {
      logger.error('Token cleanup error:', error);
    }
  }
  
  /**
   * Get refresh state statistics (for monitoring)
   */
  static getRefreshStats(): {
    activeRefreshes: number;
    oldestRefresh: number | null;
  } {
    const now = Date.now();
    let oldestRefresh: number | null = null;
    
    for (const state of refreshStates.values()) {
      if (oldestRefresh === null || state.timestamp < oldestRefresh) {
        oldestRefresh = state.timestamp;
      }
    }
    
    return {
      activeRefreshes: refreshStates.size,
      oldestRefresh: oldestRefresh ? now - oldestRefresh : null,
    };
  }
}

// Schedule periodic cleanup of expired tokens
setInterval(() => {
  TokenRefreshManager.cleanupExpiredTokens();
}, 60 * 60 * 1000); // Every hour

export default TokenRefreshManager;
