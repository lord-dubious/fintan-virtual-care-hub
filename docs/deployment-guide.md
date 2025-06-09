# Deployment Guide

This guide provides instructions for deploying the Fintan Virtual Care Hub application to Render.

## Prerequisites

1. A Render account
2. A Neon PostgreSQL database
3. Your codebase pushed to a Git repository (GitHub, GitLab, etc.)

## Setting Up Neon PostgreSQL

1. Create a new Neon project at [console.neon.tech](https://console.neon.tech)
2. Create a new database named `drfintan` (or your preferred name)
3. Create a role with appropriate permissions
4. Get your connection strings from the Neon dashboard:
   - For `DATABASE_URL`: Use the connection string with `?pgbouncer=true&connect_timeout=10` added
   - For `DIRECT_URL`: Use the direct connection string with `?connect_timeout=10` added
   - Example:
     ```
     DATABASE_URL="postgres://user:password@ep-some-id.us-east-2.aws.neon.tech/drfintan?pgbouncer=true&connect_timeout=10"
     DIRECT_URL="postgres://user:password@ep-some-id.us-east-2.aws.neon.tech/drfintan?connect_timeout=10"
     ```
5. Test your connection locally using the setup script:
   ```
   npm run db:setup
   ```

## Deploying to Render

### Step 1: Create a New Web Service

1. Log in to your Render dashboard
2. Click "New" and select "Web Service"
3. Connect your Git repository
4. Fill in the following details:
   - **Name**: `fintan-virtual-care-hub` (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

### Step 2: Configure Environment Variables

Add the following environment variables in the Render dashboard:

```
NODE_ENV=production
DATABASE_URL=postgres://user:password@ep-some-id.us-east-2.aws.neon.tech/drfintan?pgbouncer=true&connect_timeout=10
DIRECT_URL=postgres://user:password@ep-some-id.us-east-2.aws.neon.tech/drfintan?connect_timeout=10
PORT=3000
API_BASE_URL=https://your-render-app-name.onrender.com/api
FRONTEND_URL=https://your-render-app-name.onrender.com
JWT_SECRET=[YOUR_JWT_SECRET]
REFRESH_TOKEN_SECRET=[YOUR_REFRESH_TOKEN_SECRET]
CORS_ORIGIN=https://your-render-app-name.onrender.com
RUN_MIGRATIONS_ON_BUILD=true
```

Replace the placeholder values with your actual credentials and URLs.

### Step 3: Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Once deployment is complete, you can access your application at the provided URL

## Verifying Deployment

1. Visit your application URL to ensure the frontend is working
2. Test API endpoints to verify backend functionality
3. Check the Render logs for any errors or issues

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify your `DATABASE_URL` and `DIRECT_URL` environment variables
2. Ensure your Neon database is active and accessible
3. Check if your IP is allowed in Neon's IP restrictions (if enabled)
4. For Prisma-specific issues:
   - Make sure you're using the correct connection strings with `pgbouncer=true` for `DATABASE_URL`
   - Ensure `DIRECT_URL` is set correctly for migrations
   - Check that the Neon adapter is properly configured in your code

### Build Failures

If the build fails:

1. Check the build logs in Render
2. Ensure all dependencies are correctly specified in `package.json`
3. Verify that the build command is correctly set
4. Make sure Prisma can generate the client and run migrations during build

### Migration Issues

If database migrations fail:

1. Check if `RUN_MIGRATIONS_ON_BUILD` is set to `true`
2. Verify that your Prisma schema is valid
3. Check if the database user has sufficient permissions
4. Try running migrations manually:
   ```
   npx prisma migrate deploy
   ```

## Updating Your Deployment

When you push changes to your repository:

1. Render will automatically detect the changes
2. It will rebuild and redeploy your application
3. Database migrations will run automatically if `RUN_MIGRATIONS_ON_BUILD` is set to `true`

## Scaling Your Application

As your application grows, you may need to:

1. Upgrade your Render plan for more resources
2. Scale your Neon database for better performance
3. Consider adding a CDN for static assets
4. Implement caching strategies for frequently accessed data

## Neon Serverless PostgreSQL Considerations

When using Neon with a serverless deployment like Render:

1. **Connection Pooling**: Always use the connection string with `pgbouncer=true` for your main database connection
2. **Cold Starts**: Be aware that serverless databases may have cold starts, which can affect initial response times
3. **Connection Limits**: Monitor your connection usage as serverless plans often have connection limits
4. **Autoscaling**: Configure your Neon project for autoscaling if you expect variable workloads
5. **Backups**: Set up regular backups of your database to prevent data loss

