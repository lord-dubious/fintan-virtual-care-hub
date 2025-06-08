import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

// Configure neon to use WebSockets for serverless environments
neonConfig.webSocketConstructor = globalThis.WebSocket;

// Create connection pool
const connectionString = process.env.DATABASE_URL;

// For edge runtimes, use the neon HTTP adapter
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  // For production, use the Neon adapter with connection pooling
  const pool = new Pool({ connectionString });
  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // For development, use the standard Prisma client
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
}

export { prisma };

// Helper function to handle vector operations
export async function createEmbedding(text: string, dimensions = 1536) {
  // This is a placeholder. In a real application, you would:
  // 1. Call an embedding API (like OpenAI's)
  // 2. Return the vector
  // For now, we'll return a mock vector of the specified dimensions
  return Array(dimensions).fill(0).map(() => Math.random() - 0.5);
}

// Example function to perform vector similarity search
export async function findSimilarEntries(embedding: number[], limit = 5) {
  // This uses the cosine similarity operator <=> from pgvector
  const result = await prisma.$queryRaw`
    SELECT id, content, 1 - (embedding <=> ${embedding}::vector) as similarity
    FROM "BrainEntry"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${embedding}::vector
    LIMIT ${limit}
  `;
  
  return result;
}

