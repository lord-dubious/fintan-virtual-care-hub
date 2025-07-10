# Deployment Guide - Dr. Fintan's Virtual Care Hub

This guide provides comprehensive instructions for deploying the Dr. Fintan Virtual Care Hub to various platforms.

## 🚀 Quick Deployment Options

### Option 1: Render.com (Recommended)
- **Frontend**: Static site deployment
- **Backend**: Node.js service
- **Database**: PostgreSQL (Neon recommended)

### Option 2: Vercel + Railway
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Neon PostgreSQL

### Option 3: Self-hosted
- **Server**: VPS with Docker
- **Database**: PostgreSQL
- **Reverse Proxy**: Nginx

## 📋 Prerequisites

Before deploying, ensure you have:

1. **Accounts Setup**:
   - [Render.com](https://render.com) account (recommended)
   - [Neon](https://neon.tech) account for PostgreSQL
   - [Daily.co](https://daily.co) account for video calls
   - [Stripe](https://stripe.com) account for payments

2. **API Keys Required**:
   - Daily.co API key and domain
   - Stripe publishable and secret keys
   - Database connection strings
   - JWT secrets

## 🎯 Render.com Deployment (Recommended)

### Step 1: Database Setup (Neon)

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection strings:
   - `DATABASE_URL` (pooled connection)
   - `DIRECT_URL` (direct connection)

### Step 2: Repository Setup

1. Fork or clone this repository
2. Push to your GitHub account
3. Ensure the `render.yaml` file is in the root

### Step 3: Render Deployment

1. **Connect Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository with the `render.yaml` file

2. **Environment Variables**:
   
   **Frontend Service**:
   ```bash
   VITE_BACKEND_URL=https://your-backend-service.onrender.com
   VITE_DAILY_DOMAIN=your-daily-domain
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   VITE_DEFAULT_PROVIDER_ID=your-default-provider-id
   ```

   **Backend Service**:
   ```bash
   NODE_ENV=production
   PORT=3000
   HOST=0.0.0.0
   
   # Database
   DATABASE_URL=postgresql://username:password@host.neon.tech/database?pgbouncer=true&connect_timeout=10
   DIRECT_URL=postgresql://username:password@host.neon.tech/database?connect_timeout=10
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   
   # Daily.co
   DAILY_API_KEY=your-daily-api-key
   
   # Stripe
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   
   # Security
   SESSION_SECRET=your-session-secret
   CORS_ORIGIN=https://your-frontend-service.onrender.com
   ```

3. **Deploy**:
   - Click "Apply" to start deployment
   - Monitor the build logs
   - Both services should deploy automatically

### Step 4: Post-Deployment Setup

1. **Database Migration**:
   ```bash
   # This runs automatically on first deployment
   # If needed manually: npm run prisma:deploy
   ```

2. **Seed Database** (Optional):
   ```bash
   # Run from backend service shell
   npm run seed
   ```

3. **Test Deployment**:
   - Visit your frontend URL
   - Test user registration/login
   - Verify video call functionality
   - Test payment processing

## 🔧 Manual Deployment Scripts

Use the provided deployment script for easier management:

```bash
# Build and deploy frontend
./scripts/deploy-render.sh frontend

# Build and deploy backend
./scripts/deploy-render.sh backend

# Deploy both
./scripts/deploy-render.sh all
```

## 🌐 Alternative Platforms

### Vercel + Railway

**Frontend (Vercel)**:
1. Connect GitHub repository to Vercel
2. Set build command: `npm run build:frontend`
3. Set output directory: `dist`
4. Add environment variables (same as above)

**Backend (Railway)**:
1. Connect repository to Railway
2. Set start command: `npm run start:backend`
3. Add environment variables
4. Connect PostgreSQL database

### Docker Deployment

```dockerfile
# Use the provided Dockerfile
docker build -t fintan-care-hub .
docker run -p 3000:3000 -p 10000:10000 fintan-care-hub
```

## 🔐 API Keys & Service Setup

### Daily.co Setup
1. Sign up at [daily.co](https://daily.co)
2. Go to Developers → API Keys
3. Create a new API key
4. Set up your domain in Dashboard → Domains
5. Copy the API key and domain name

### Stripe Setup
1. Create account at [stripe.com](https://stripe.com)
2. Go to Developers → API Keys
3. Copy publishable key (pk_test_...) and secret key (sk_test_...)
4. Set up webhooks for payment confirmation
5. Copy webhook secret (whsec_...)

### Neon PostgreSQL Setup
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Go to Dashboard → Connection Details
4. Copy both pooled and direct connection strings
5. Ensure connection pooling is enabled

## 🔍 Environment Variables Reference

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT token signing
- `DAILY_API_KEY`: Daily.co API key
- `STRIPE_SECRET_KEY`: Stripe secret key

### Optional Variables
- `CORS_ORIGIN`: Restrict CORS to specific origins
- `LOG_LEVEL`: Logging level (info, debug, error)
- `RATE_LIMIT_MAX_REQUESTS`: API rate limiting
- `SESSION_SECRET`: Session encryption secret

## 🚨 Security Checklist

- [ ] Set strong JWT secrets (32+ characters)
- [ ] Configure CORS_ORIGIN for production
- [ ] Use HTTPS in production
- [ ] Set secure session cookies
- [ ] Enable rate limiting
- [ ] Use environment variables for all secrets
- [ ] Regularly rotate API keys
- [ ] Monitor application logs

## 🐛 Troubleshooting

### Common Issues

**Build Failures**:
- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Check TypeScript compilation errors

**Database Connection**:
- Verify connection strings are correct
- Check Neon database is running
- Ensure IP whitelist includes Render IPs

**Video Calls Not Working**:
- Verify Daily.co API key and domain
- Check browser permissions for camera/microphone
- Ensure HTTPS is enabled

**Payment Issues**:
- Verify Stripe keys are correct
- Check webhook endpoints are configured
- Ensure test/live mode consistency

### Getting Help

1. Check application logs in Render dashboard
2. Review environment variable configuration
3. Test API endpoints individually
4. Contact support with specific error messages

## 📊 Monitoring & Maintenance

### Health Checks
- Frontend: `https://your-app.onrender.com`
- Backend: `https://your-api.onrender.com/health`
- Database: Monitor connection pool usage

### Regular Maintenance
- Update dependencies monthly
- Rotate API keys quarterly
- Monitor database performance
- Review security logs
- Backup database regularly

## 🎉 Success!

Once deployed successfully, your application will be available at:
- **Frontend**: `https://your-frontend-service.onrender.com`
- **Backend API**: `https://your-backend-service.onrender.com`
- **Health Check**: `https://your-backend-service.onrender.com/health`

Your Dr. Fintan Virtual Care Hub is now ready for production use!
