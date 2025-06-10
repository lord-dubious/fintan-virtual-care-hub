
import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Initialize Prisma Client
let prisma: PrismaClient;

if (typeof window === 'undefined') {
  // Server-side: create a new instance
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  
  if (connectionString) {
    // Use Neon adapter for serverless environments
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    // Fallback to regular Prisma client
    prisma = new PrismaClient();
  }
} else {
  // Client-side: use a mock or throw an error
  throw new Error('Prisma should not be used on the client side');
}

export { prisma };
export default prisma;
