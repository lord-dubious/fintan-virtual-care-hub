import { PrismaClient } from '@prisma/client';
import { config } from './index';

// Prisma Client singleton
let prisma: PrismaClient;

declare global {
  var __prisma: PrismaClient | undefined;
}

// Create Prisma Client instance
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: config.server.isDevelopment 
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
    datasources: {
      db: {
        url: config.database.url,
      },
    },
  });
}

// Initialize Prisma Client
if (config.server.isProduction) {
  prisma = createPrismaClient();
} else {
  // In development, use global variable to prevent multiple instances
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

// Database connection health check
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
}

// Database health check with timeout
export async function healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; latency?: number }> {
  const startTime = Date.now();
  
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database health check timeout')), config.database.healthCheckTimeout);
    });
    
    const healthCheckPromise = prisma.$queryRaw`SELECT 1`;
    
    await Promise.race([healthCheckPromise, timeoutPromise]);
    
    const latency = Date.now() - startTime;
    return { status: 'healthy', latency };
  } catch (error) {
    console.error('Database health check failed:', error);
    return { status: 'unhealthy' };
  }
}

// Export Prisma Client instance
export { prisma };
export default prisma;
