import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connection configuration
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}
const connectionString = process.env.DATABASE_URL;

// Create connection pool
const pool = new Pool({ connectionString });

// Create Neon adapter
const adapter = new PrismaNeon(pool);

// Create and export Prisma client with Neon adapter
const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Define global type for PrismaClient
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Create global variable for PrismaClient
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Export Prisma client (create new or use existing)
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Set global Prisma client in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Helper function for vector similarity search
export async function findSimilarEntries(
  model: { findMany: (options: Record<string, unknown>) => Promise<unknown[]> },
  embedding: number[],
  field: string,
  limit: number = 5
) {
  // This is a placeholder for vector similarity search
  // Actual implementation would depend on your specific needs
  return await model.findMany({
    take: limit,
    orderBy: {
      // This assumes you have a function to calculate similarity
      // You might need to implement this differently based on your database
      _relevance: {
        [field]: embedding,
      },
    },
  });
}

// Clean up function to be called on application shutdown
export async function disconnectPrisma() {
  await prisma.$disconnect();
  await pool.end();
}
