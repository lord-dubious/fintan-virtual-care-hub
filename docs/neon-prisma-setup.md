# Neon PostgreSQL and Prisma Setup Guide

This guide explains how to set up and configure Neon PostgreSQL with Prisma for the Fintan Virtual Care Hub application.

## What is Neon?

Neon is a serverless PostgreSQL service that separates storage and compute to offer autoscaling, branching, and bottomless storage. It's particularly well-suited for serverless deployments like Render.

## Prerequisites

1. A Neon account (sign up at [neon.tech](https://neon.tech))
2. Node.js and npm installed
3. Basic knowledge of PostgreSQL and Prisma

## Setting Up Neon

### Step 1: Create a Neon Project

1. Sign in to your Neon account
2. Click "New Project"
3. Name your project (e.g., "fintan-virtual-care")
4. Select a region closest to your users
5. Click "Create Project"

### Step 2: Create a Database

1. In your new project, go to the "Databases" tab
2. Click "Create Database"
3. Name your database (e.g., "drfintan")
4. Click "Create"

### Step 3: Get Connection Strings

1. Go to the "Connection Details" tab
2. Note the connection string provided
3. You'll need to create two versions of this string:
   - `DATABASE_URL`: Add `?pgbouncer=true&connect_timeout=10` to the end
   - `DIRECT_URL`: Add `?connect_timeout=10` to the end

Example:
```
DATABASE_URL="postgres://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_NEON_HOST].neon.tech/[YOUR_DATABASE]?pgbouncer=true&connect_timeout=10"
DIRECT_URL="postgres://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_NEON_HOST].neon.tech/[YOUR_DATABASE]?connect_timeout=10"
```

## Configuring Prisma with Neon

### Step 1: Install Required Dependencies

```bash
npm install @prisma/client @prisma/adapter-neon @neondatabase/serverless
```

### Step 2: Configure Prisma Client

Create or update your Prisma client configuration file (e.g., `src/lib/prisma.ts`):

```typescript
import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connection configuration
const connectionString = process.env.DATABASE_URL || '';

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
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Clean up function to be called on application shutdown
export async function disconnectPrisma() {
  await prisma.$disconnect();
  await pool.end();
}
```

### Step 3: Update Environment Variables

Ensure your `.env` file contains both connection strings:

```
DATABASE_URL="postgres://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_NEON_HOST].neon.tech/[YOUR_DATABASE]?pgbouncer=true&connect_timeout=10"
DIRECT_URL="postgres://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_NEON_HOST].neon.tech/[YOUR_DATABASE]?connect_timeout=10"
```

### Step 4: Configure Prisma Schema

Ensure your `prisma/schema.prisma` file is configured for PostgreSQL:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Your models here...
```

## Running Migrations

### Initial Setup

1. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

2. Create and apply migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

### Production Migrations

For production deployments (like Render), use:

```bash
npx prisma migrate deploy
```

This is automatically included in the build script in `package.json`:

```json
"build": "prisma generate && prisma migrate deploy && vite build"
```

## Testing the Connection

Run the setup script to test your Neon connection:

```bash
npm run db:setup
```

This script will:
1. Connect to your Neon database
2. Verify the connection is working
3. Display basic database information

## Troubleshooting

### Connection Issues

1. **Error: Could not connect to database**: Verify your connection strings and ensure your IP is allowed in Neon's IP restrictions (if enabled)

2. **Error: P1001: Can't reach database server**: Check if your Neon project is active and not in a suspended state

3. **Error: P1003: Database does not exist**: Ensure you've created the database in Neon and specified the correct database name in your connection string

### Migration Issues

1. **Error: P1001 during migration**: Make sure you're using the `DIRECT_URL` for migrations (Prisma uses this automatically)

2. **Error: P1010: User does not have permission**: Ensure your database user has the necessary permissions

## Best Practices for Neon with Prisma

1. **Connection Pooling**: Always use `pgbouncer=true` in your `DATABASE_URL` to enable connection pooling

2. **Direct URL for Migrations**: Always provide a `DIRECT_URL` without pgbouncer for migrations

3. **Connection Timeout**: Add `connect_timeout=10` to both URLs to prevent hanging connections

4. **Connection Management**: Properly close connections when your application shuts down

5. **Serverless Considerations**: Be mindful of connection limits and cold starts in serverless environments
