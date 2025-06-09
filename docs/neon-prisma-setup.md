# Setting Up Prisma with Neon Serverless PostgreSQL

This guide explains how to set up and use Prisma with Neon Serverless PostgreSQL for the Fintan Virtual Care Hub.

## Prerequisites

- A Neon account (sign up at [neon.tech](https://neon.tech))
- Node.js and npm/yarn installed

## Step 1: Create a Neon Project

1. Sign up or log in to [Neon](https://console.neon.tech)
2. Create a new project
3. Note your connection details (you'll need these for your `.env` file)

## Step 2: Configure Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
DATABASE_URL="postgres://user:password@ep-some-id.region.aws.neon.tech/drfintan?pgbouncer=true&connect_timeout=10"
DIRECT_URL="postgres://user:password@ep-some-id.region.aws.neon.tech/drfintan?connect_timeout=10"
```

Replace the placeholders with your actual Neon connection details:
- `user`: Your Neon database username
- `password`: Your Neon database password
- `ep-some-id.region.aws.neon.tech`: Your Neon endpoint
- `drfintan`: Your database name

## Step 3: Initialize Prisma

If you haven't already initialized Prisma, run:

```bash
npx prisma init
```

## Step 4: Run Migrations

To create your database schema in Neon:

```bash
npx prisma migrate dev --name init
```

This will:
1. Create the necessary tables in your Neon database
2. Generate the Prisma client

## Step 5: Enable pgvector Extension

The schema is already configured to use the pgvector extension. When you run migrations, Prisma will automatically enable this extension in your Neon database.

## Step 6: Using Prisma in Your Application

Import and use the Prisma client in your application:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Example: Create a user
async function createUser() {
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Example User',
    },
  })
  console.log(user)
}
```

## Connection Pooling

Neon uses connection pooling via PgBouncer. The `DATABASE_URL` includes the `pgbouncer=true` parameter to enable this feature. For operations that are not compatible with PgBouncer (like schema migrations), Prisma will use the `DIRECT_URL`.

## Troubleshooting

- **Connection Issues**: Ensure your IP is allowed in Neon's IP restrictions
- **Migration Errors**: Check that your `DIRECT_URL` is correctly configured
- **Vector Operations**: If you encounter issues with vector operations, verify that the pgvector extension is properly enabled

## Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma with Neon Guide](https://neon.tech/docs/guides/prisma)
- [Prisma Documentation](https://www.prisma.io/docs)

