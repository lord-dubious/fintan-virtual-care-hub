import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('🧪 Testing Neon PostgreSQL connection...');
  
  // Check for required environment variables
  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    console.error('❌ Error: DATABASE_URL and DIRECT_URL environment variables are required');
    console.error('Please set these variables in your .env file');
    process.exit(1);
  }
  
  // Verify connection strings format
  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  
  if (!databaseUrl.includes('pgbouncer=true')) {
    console.warn('⚠️ Warning: DATABASE_URL should include pgbouncer=true for connection pooling');
  }
  
  console.log('📊 Connection strings format:');
  console.log(`DATABASE_URL: ${databaseUrl.replace(/:[^:]*@/, ':****@')}`);
  console.log(`DIRECT_URL: ${directUrl.replace(/:[^:]*@/, ':****@')}`);
  
  try {
    // Create connection pool
    console.log('🔄 Creating connection pool...');
    const pool = new Pool({ connectionString: databaseUrl });
    
    // Create Neon adapter
    console.log('🔄 Creating Neon adapter...');
    const adapter = new PrismaNeon(pool);
    
    // Create Prisma client with Neon adapter
    console.log('🔄 Initializing Prisma client...');
    const prisma = new PrismaClient({ adapter });
    
    // Test connection
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Successfully connected to Neon database');
    
    // Get database information
    console.log('🔄 Fetching database information...');
    const result = await prisma.$queryRaw`SELECT current_database(), current_schema(), version()`;
    console.log('📊 Database information:');
    console.log(result);
    
    // Test query performance
    console.log('🔄 Testing query performance...');
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const endTime = Date.now();
    console.log(`✅ Query completed in ${endTime - startTime}ms`);
    
    // Clean up
    console.log('🔄 Closing connections...');
    await prisma.$disconnect();
    await pool.end();
    
    console.log('✅ Neon database connection test completed successfully');
  } catch (error) {
    console.error('❌ Error testing Neon database connection:', error);
    process.exit(1);
  }
}

main();

