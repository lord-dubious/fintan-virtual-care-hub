import { Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { config } from '@/config';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthUser } from '@/types';

export interface AuthenticatedSocket extends Socket {
  user?: AuthUser;
}

export const SocketAuthMiddleware = async (socket: AuthenticatedSocket, next: (err?: Error) => void) => {
  try {
    // Get token from handshake auth or query
    const token = socket.handshake.auth['token'] || socket.handshake.query['token'];

    if (!token) {
      logger.warn('🔒 Socket connection rejected: No token provided');
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token as string, config.auth.jwtSecret) as any;
    
    if (!decoded || !decoded.userId) {
      logger.warn('🔒 Socket connection rejected: Invalid token');
      return next(new Error('Invalid authentication token'));
    }

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
        updatedAt: true
      }
    });

    if (!user) {
      logger.warn(`🔒 Socket connection rejected: User not found for ID ${decoded.userId}`);
      return next(new Error('User not found'));
    }

    // Attach user to socket
    socket.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    logger.info(`🔓 Socket authenticated for user: ${user.name} (${user.email})`);
    next();

  } catch (error) {
    logger.error('🔒 Socket authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new Error('Invalid authentication token'));
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      return next(new Error('Authentication token expired'));
    }
    
    return next(new Error('Authentication failed'));
  }
};
