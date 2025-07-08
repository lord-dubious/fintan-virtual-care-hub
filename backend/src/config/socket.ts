import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { config } from '@/config';
import logger from '@/config/logger';
import { AuthenticatedSocket, SocketAuthMiddleware } from '@/middleware/socketAuth';

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.frontend.url,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware for Socket.IO
    this.io.use(SocketAuthMiddleware);
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.user?.id;
      const userName = socket.user?.name || 'Unknown User';

      logger.info(`🔌 User connected: ${userName} (${userId}) - Socket: ${socket.id}`);

      if (userId) {
        this.connectedUsers.set(userId, socket.id);
        
        // Join user to their personal room for targeted messages
        socket.join(`user:${userId}`);
        
        // Join user to their role-based room
        if (socket.user?.role) {
          socket.join(`role:${socket.user.role.toLowerCase()}`);
        }
      }

      // Handle ping-pong test
      socket.on('ping', (data) => {
        logger.info(`📡 Ping received from ${userName}: ${JSON.stringify(data)}`);
        socket.emit('pong', {
          message: 'Pong from server!',
          timestamp: new Date().toISOString(),
          originalData: data
        });
      });

      // Handle appointment updates
      socket.on('appointment:subscribe', (appointmentId: string) => {
        socket.join(`appointment:${appointmentId}`);
        logger.info(`📅 User ${userName} subscribed to appointment ${appointmentId}`);
      });

      socket.on('appointment:unsubscribe', (appointmentId: string) => {
        socket.leave(`appointment:${appointmentId}`);
        logger.info(`📅 User ${userName} unsubscribed from appointment ${appointmentId}`);
      });

      // Handle activity updates
      socket.on('activity:subscribe', () => {
        socket.join(`activity:${userId}`);
        logger.info(`📊 User ${userName} subscribed to activity updates`);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`🔌 User disconnected: ${userName} - Reason: ${reason}`);
        if (userId) {
          this.connectedUsers.delete(userId);
        }
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`❌ Socket error for user ${userName}:`, error);
      });
    });
  }

  // Public methods for emitting events

  /**
   * Send a message to a specific user
   */
  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
    logger.info(`📤 Sent ${event} to user ${userId}`);
  }

  /**
   * Send a message to all users with a specific role
   */
  public sendToRole(role: string, event: string, data: any) {
    this.io.to(`role:${role.toLowerCase()}`).emit(event, data);
    logger.info(`📤 Sent ${event} to role ${role}`);
  }

  /**
   * Send appointment update to all subscribers
   */
  public sendAppointmentUpdate(appointmentId: string, data: any) {
    this.io.to(`appointment:${appointmentId}`).emit('appointment:updated', data);
    logger.info(`📅 Sent appointment update for ${appointmentId}`);
  }

  /**
   * Send activity update to a specific user
   */
  public sendActivityUpdate(userId: string, data: any) {
    this.io.to(`activity:${userId}`).emit('activity:updated', data);
    logger.info(`📊 Sent activity update to user ${userId}`);
  }

  /**
   * Broadcast to all connected clients
   */
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
    logger.info(`📡 Broadcasted ${event} to all clients`);
  }

  /**
   * Get connected users count
   */
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Check if a user is connected
   */
  public isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get the Socket.IO server instance
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  public close(): void {
    logger.info('🔌 Closing Socket.IO server...');

    // Disconnect all connected clients
    this.io.sockets.sockets.forEach((socket) => {
      socket.disconnect(true);
    });

    // Close the Socket.IO server
    this.io.close();

    // Clear connected users map
    this.connectedUsers.clear();

    logger.info('✅ Socket.IO server closed successfully');
  }
}

// Singleton instance
let socketService: SocketService | null = null;

export const initializeSocket = (httpServer: HTTPServer): SocketService => {
  if (!socketService) {
    socketService = new SocketService(httpServer);
    logger.info('🚀 Socket.IO service initialized');
  }
  return socketService;
};

export const getSocketService = (): SocketService => {
  if (!socketService) {
    throw new Error('Socket service not initialized. Call initializeSocket first.');
  }
  return socketService;
};
