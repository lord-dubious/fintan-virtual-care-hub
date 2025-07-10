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
      ? ['query', 'info', 'warn']  // Removed 'error' to reduce connection noise
      : ['warn', 'error'],
    datasources: {
      db: {
        url: config.database.url,
      },
    },
    // Error formatting to reduce noise
    errorFormat: 'minimal',
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

// Database connection health check with retry
export async function checkDatabaseConnection(retries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Use parameterized query to prevent SQL injection
      await prisma.$queryRaw`SELECT 1 as health_check`;
      return true;
    } catch (error) {
      console.warn(`Database connection attempt ${attempt}/${retries} failed:`, error);

      if (attempt === retries) {
        console.error('Database connection failed after all retries');
        return false;
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  return false;
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
    
    const healthCheckPromise = prisma.$queryRaw`SELECT 1 as health_check`;

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
