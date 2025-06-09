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
4. Get your connection string from the Neon dashboard
5. Make sure to note both the pooled connection string (for `DATABASE_URL`) and the direct connection string (for `DIRECT_URL`)

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
DATABASE_URL=[YOUR_NEON_CONNECTION_STRING_WITH_PGBOUNCER]
DIRECT_URL=[YOUR_NEON_DIRECT_CONNECTION_STRING]
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

### Build Failures

If the build fails:

1. Check the build logs in Render
2. Ensure all dependencies are correctly specified in `package.json`
3. Verify that the build command is correctly set

### Migration Issues

If database migrations fail:

1. Check if `RUN_MIGRATIONS_ON_BUILD` is set to `true`
2. Verify that your Prisma schema is valid
3. Check if the database user has sufficient permissions

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

