import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('Setting up Neon database connection...');
  
  // Check for required environment variables
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    console.error('Error: DATABASE_URL and DIRECT_URL environment variables are required');
    console.error('Please set these variables in your .env file');
    process.exit(1);
  }
  
  try {
    // Create connection pool
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Create Neon adapter
    const adapter = new PrismaNeon(pool);
    
    // Create Prisma client with Neon adapter
    const prisma = new PrismaClient({ adapter });
    
    // Test connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✅ Successfully connected to Neon database');
    
    // Get database information
    const result = await prisma.$queryRaw`SELECT current_database(), current_schema()`;
    console.log('Database information:', result);
    
    // Clean up
    await prisma.$disconnect();
    await pool.end();
    
    console.log('✅ Neon database setup complete');
  } catch (error) {
    console.error('Error setting up Neon database:', error);
    process.exit(1);
  }
}

main();

