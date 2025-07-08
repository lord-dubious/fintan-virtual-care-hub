# Dr. Fintan's Virtual Care Hub - Deployment Guide

## 🚀 **PRODUCTION DEPLOYMENT STEPS**

### **Prerequisites**
- Node.js 18+ and npm 8+
- PostgreSQL database (Neon recommended)
- Daily.co account for video/audio calls
- Payment provider accounts (Stripe, Paystack, etc.)
- Email service (Gmail/SMTP)
- SMS service (Twilio) - optional

---

## **Step 1: Environment Setup**

### **1.1 Clone and Install**
```bash
git clone https://github.com/lord-dubious/fintan-virtual-care-hub.git
cd fintan-virtual-care-hub

# Install all dependencies (frontend + backend)
npm run full:install
```

### **1.2 Environment Configuration**
Copy the example environment file and configure:
```bash
cp .env.example .env
```

⚠️ **SECURITY WARNING**: Never commit actual credentials to version control. Always use placeholder values in example files and configure real credentials only in your local/production environment files.

**Required Environment Variables:**
```env
# Database (Configure with your actual credentials)
DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require&pgbouncer=true&connect_timeout=10"
DIRECT_URL="postgresql://[USERNAME]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require&connect_timeout=10"

# API Configuration
VITE_API_URL=https://your-api-domain.com/api
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here

# Daily.co (Required for video/audio calls)
DAILY_API_KEY=your-daily-api-key-here
DAILY_DOMAIN=your-daily-domain.daily.co
VITE_DAILY_DOMAIN=your-daily-domain.daily.co

# Stripe (Required for payments)
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key

# Email (Required for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@drfintan.com
```

---

## **Step 2: Database Setup**

### **2.1 Generate Prisma Client and Deploy Schema**
```bash
npm run prisma:generate
npm run prisma:deploy
```

### **2.2 Verify Database Connection**
```bash
npm run prisma:studio
```
This opens Prisma Studio to verify your database is connected and tables are created.

---

## **Step 3: External Service Configuration**

### **3.1 Daily.co Setup (Video/Audio Calls)**
1. Sign up at [Daily.co](https://daily.co)
2. Create a new domain
3. Get your API key from the dashboard
4. Add to environment variables

### **3.2 Stripe Setup (Payments)**
1. Sign up at [Stripe](https://stripe.com)
2. Get your API keys from the dashboard
3. Set up webhooks for payment confirmations
4. Add keys to environment variables

### **3.3 Email Setup (Notifications)**
1. Enable 2FA on your Gmail account
2. Generate an app password
3. Add credentials to environment variables

---

## **Step 4: Development Testing**

### **4.1 Start Development Servers**
```bash
# Start both frontend and backend in development mode
npm run full:dev
```

This starts:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Health Check: http://localhost:3000/health

### **4.2 Test Core Features**
1. **Authentication**: Register/login with real accounts
2. **Appointments**: Book appointments with real calendar integration
3. **Payments**: Test payment processing (use Stripe test mode)
4. **Video Calls**: Test video/audio consultations
5. **Dashboard**: Verify real-time statistics

---

## **Step 5: Production Deployment**

### **5.1 Frontend Deployment (Vercel/Netlify)**

**Option A: Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Option B: Netlify**
```bash
# Build for production
npm run build

# Deploy dist folder to Netlify
```

### **5.2 Backend Deployment**

**Option A: Railway (Recommended)**
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy the `server` directory

**Option B: Render (Detailed Instructions)**

#### Setting Up Render
1. Log in to your Render dashboard
2. Click "New" and select "Web Service"
3. Connect your Git repository
4. Fill in the following details:
   - **Name**: `fintan-virtual-care-hub` (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

#### Configure Render Environment Variables
Add the following environment variables in the Render dashboard:

```
NODE_ENV=production
DATABASE_URL=postgres://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_NEON_HOST].neon.tech/[YOUR_DATABASE]?pgbouncer=true&connect_timeout=10
DIRECT_URL=postgres://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_NEON_HOST].neon.tech/[YOUR_DATABASE]?connect_timeout=10
PORT=3000
API_BASE_URL=https://your-render-app-name.onrender.com/api
FRONTEND_URL=https://your-render-app-name.onrender.com
JWT_SECRET=[YOUR_JWT_SECRET]
REFRESH_TOKEN_SECRET=[YOUR_REFRESH_TOKEN_SECRET]
CORS_ORIGIN=https://your-render-app-name.onrender.com
RUN_MIGRATIONS_ON_BUILD=true
```
Replace the placeholder values with your actual credentials and URLs.

#### Deploy to Render
1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Once deployment is complete, you can access your application at the provided URL

### **5.3 Database (Already Configured)**
Your Neon PostgreSQL database is already set up and configured.

---

## **Step 6: Production Configuration**

### **6.1 Update Environment Variables**
Update your production environment with:
```env
NODE_ENV=production
VITE_API_URL=https://your-backend-domain.com/api
CORS_ORIGIN=https://your-frontend-domain.com
```

### **6.2 SSL/HTTPS Setup**
Ensure both frontend and backend are served over HTTPS for:
- Payment processing security
- Video call functionality
- Authentication security

---

## **Step 7: Post-Deployment Verification**

### **7.1 Health Checks**
- Frontend: Verify site loads and UI is responsive
- Backend: Check `/health` endpoint returns 200
- Database: Verify connections and data persistence

### **7.2 Feature Testing**
1. **User Registration/Login**: Test with real email addresses
2. **Appointment Booking**: Book and confirm appointments
3. **Payment Processing**: Process real payments (small amounts)
4. **Video Consultations**: Test video/audio calls
5. **Email Notifications**: Verify emails are sent
6. **Admin Dashboard**: Check real-time data updates

### **7.3 Performance Monitoring**
- Set up error tracking (Sentry recommended)
- Monitor API response times
- Track user engagement metrics

---

## **Step 8: Ongoing Maintenance**

### **8.1 Database Backups**
Neon automatically handles backups, but consider:
- Regular data exports
- Testing restore procedures

### **8.2 Security Updates**
- Regularly update dependencies
- Monitor for security vulnerabilities
- Rotate API keys periodically

### **8.3 Monitoring**
- Set up uptime monitoring
- Monitor payment processing
- Track video call quality

---

## **🔧 TROUBLESHOOTING**

### **Common Issues**

**1. Database Connection Errors**
- Verify DATABASE_URL is correct
- Check network connectivity
- Ensure Prisma client is generated

**2. Video Calls Not Working**
- Verify Daily.co domain and API key
- Check HTTPS is enabled
- Ensure browser permissions for camera/mic

**3. Payment Processing Fails**
- Verify Stripe keys are correct
- Check webhook endpoints
- Ensure HTTPS for payment pages

**4. Email Notifications Not Sent**
- Verify SMTP credentials
- Check Gmail app password
- Ensure firewall allows SMTP traffic

### **Support Resources**
- [Prisma Documentation](https://prisma.io/docs)
- [Daily.co API Docs](https://docs.daily.co)
- [Stripe Integration Guide](https://stripe.com/docs)
- [Neon Database Docs](https://neon.tech/docs)

---

## **🎉 SUCCESS!**

Once deployed, you'll have a fully functional healthcare platform with:
- ✅ Real user authentication and management
- ✅ Functional appointment booking and scheduling
- ✅ Working video/audio consultations
- ✅ Live payment processing
- ✅ Real-time dashboard analytics
- ✅ Email notifications and calendar integration
- ✅ Mobile-responsive design
- ✅ Production-ready security

Your Dr. Fintan's Virtual Care Hub is now ready to serve real patients and provide professional healthcare consultations! 🏥✨
