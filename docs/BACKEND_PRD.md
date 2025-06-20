# Dr. Fintan Virtual Care Hub - Backend API Server PRD

## 🎯 **PROJECT OVERVIEW**

### **Current Status**
- ✅ **Frontend**: 100% complete and functional on http://localhost:10000/
- ✅ **Database**: Neon PostgreSQL configured with Prisma schema
- ✅ **UI Components**: All pages, routing, booking flow, admin portal working
- ❌ **Backend API**: Missing - needs to be created separately

### **Objective**
Create a standalone Node.js/Express backend API server that serves the existing frontend without modifying any frontend code.

## 🏗️ **ARCHITECTURE REQUIREMENTS**

### **Separation of Concerns**
```
frontend/                 backend/
├── src/                 ├── src/
│   ├── pages/          │   ├── routes/
│   ├── components/     │   ├── controllers/
│   ├── api/ (clients)  │   ├── services/
│   └── ...             │   ├── middleware/
├── package.json        │   └── models/
└── vite.config.ts      ├── package.json
                        └── server.js
```

### **API Specifications**
- **Base URL**: `http://localhost:3000/api`
- **Authentication**: JWT tokens
- **Database**: Existing Neon PostgreSQL via Prisma
- **Documentation**: Based on `docs/api-endpoints.md`

## 📋 **FUNCTIONAL REQUIREMENTS**

### **Phase 1: Core Authentication & User Management**
- [ ] User registration/login endpoints
- [ ] JWT token generation and validation
- [ ] Password reset functionality
- [ ] User profile management
- [ ] Role-based access control (PATIENT, PROVIDER, ADMIN)

### **Phase 2: Appointment System**
- [ ] Appointment booking endpoints
- [ ] Provider availability management
- [ ] Appointment status updates
- [ ] Calendar integration APIs
- [ ] Appointment notifications

### **Phase 3: Consultation Management**
- [ ] Daily.co room creation
- [ ] Video/audio call management
- [ ] Consultation status tracking
- [ ] Medical record creation
- [ ] Prescription management

### **Phase 4: Payment Processing**
- [ ] Stripe payment integration
- [ ] Paystack payment support
- [ ] Payment intent creation
- [ ] Payment confirmation
- [ ] Payment history tracking

### **Phase 5: Admin Dashboard**
- [ ] User management endpoints
- [ ] System statistics
- [ ] Provider approval workflow
- [ ] Payment analytics
- [ ] System monitoring

## 🔧 **TECHNICAL SPECIFICATIONS**

### **Technology Stack**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Existing Neon PostgreSQL
- **ORM**: Prisma (existing schema)
- **Authentication**: JWT + bcrypt
- **Validation**: Joi or Zod
- **Testing**: Jest + Supertest

### **Environment Variables**
```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database (existing)
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Authentication
JWT_SECRET=fintan_virtual_care_jwt_secret_key_2024_development
JWT_EXPIRES_IN=7d

# External Services
DAILY_API_KEY=ef46f246612c7f5604f5f083b4eb615276d075944ac40c197189f446a305f4db
STRIPE_SECRET_KEY=[TO_BE_CONFIGURED]
PAYSTACK_SECRET_KEY=[TO_BE_CONFIGURED]

# Email/SMS
SMTP_HOST=smtp.gmail.com
SMTP_USER=[TO_BE_CONFIGURED]
SMTP_PASS=[TO_BE_CONFIGURED]
```

### **API Endpoints Structure**
```
/api/auth/*           - Authentication endpoints
/api/patients/*       - Patient management
/api/providers/*      - Provider management  
/api/appointments/*   - Appointment system
/api/consultations/*  - Video/audio calls
/api/payments/*       - Payment processing
/api/admin/*          - Admin functions
/api/notifications/*  - Notification system
```

## 🚀 **IMPLEMENTATION PLAN**

### **Step 1: Project Setup**
```bash
mkdir backend
cd backend
npm init -y
npm install express prisma @prisma/client bcryptjs jsonwebtoken
npm install -D nodemon jest supertest
```

### **Step 2: Database Integration**
- Copy existing Prisma schema
- Configure database connection
- Set up Prisma client
- Create database services

### **Step 3: Core Server Setup**
- Express server configuration
- CORS setup for frontend
- Error handling middleware
- Request logging
- Health check endpoint

### **Step 4: Authentication System**
- JWT middleware
- Password hashing
- Login/register endpoints
- Token refresh mechanism
- Role-based authorization

### **Step 5: API Implementation**
- Implement endpoints per `docs/api-endpoints.md`
- Add input validation
- Error handling
- Response formatting
- API documentation

## 📊 **SUCCESS CRITERIA**

### **Functional Tests**
- [ ] User can register and login via frontend
- [ ] Booking flow works end-to-end
- [ ] Payment processing functional
- [ ] Video calls can be initiated
- [ ] Admin dashboard shows real data
- [ ] Email notifications sent

### **Technical Tests**
- [ ] All API endpoints respond correctly
- [ ] Database operations work
- [ ] Authentication tokens valid
- [ ] CORS configured properly
- [ ] Error handling robust
- [ ] Performance acceptable (<500ms response)

## 🔒 **SECURITY REQUIREMENTS**

- JWT token expiration and refresh
- Password hashing with bcrypt
- Input validation and sanitization
- SQL injection prevention (Prisma)
- Rate limiting on auth endpoints
- HTTPS in production
- Environment variable protection

## 📈 **MONITORING & LOGGING**

- Request/response logging
- Error tracking
- Performance monitoring
- Database query logging
- Authentication attempt logging
- Payment transaction logging

## 🎯 **DELIVERABLES**

1. **Backend API Server** - Fully functional Express.js server
2. **API Documentation** - Updated endpoint documentation
3. **Testing Suite** - Unit and integration tests
4. **Deployment Guide** - Production deployment instructions
5. **Environment Setup** - Configuration templates

## ⚠️ **CONSTRAINTS & ASSUMPTIONS**

### **DO NOT MODIFY**
- Any files in `src/` directory (frontend)
- `package.json` in root (frontend dependencies)
- `vite.config.ts` or any frontend configuration
- Existing UI components or pages

### **ASSUMPTIONS**
- Frontend API client calls are correctly implemented
- Database schema is finalized
- External service credentials will be provided
- Frontend will remain on port 10000
- Backend will run on port 3000
