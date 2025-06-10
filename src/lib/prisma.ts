
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import dotenv from 'dotenv';

dotenv.config();

neonConfig.fetchConnectionCache = true;

const connectionString = process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/database';

const pool = new Pool({ 
  connectionString,
  ssl: true
});

const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
