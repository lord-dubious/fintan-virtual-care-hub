# Dr. Fintan Virtual Care Hub - Backend Implementation Plan

## 🎯 **IMPLEMENTATION STRATEGY**

### **Core Principle: Frontend Protection**
- **NEVER modify any files in `src/` directory**
- **NEVER change `package.json`, `vite.config.ts`, or frontend configs**
- **CREATE separate `backend/` directory for all API server code**
- **MAINTAIN frontend on port 10000, backend on port 3000**

## 📋 **PHASE-BY-PHASE BREAKDOWN**

### **Phase 1: Foundation Setup (2-3 hours)**

#### **Task 1.1: Project Structure**
```bash
backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
├── tests/
├── package.json
├── .env
└── server.js
```

#### **Task 1.2: Dependencies Installation**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.9.2",
    "nodemailer": "^6.9.4",
    "stripe": "^12.18.0",
    "axios": "^1.4.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.2",
    "supertest": "^6.3.3"
  }
}
```

#### **Task 1.3: Basic Server Setup**
- Express app configuration
- CORS setup for frontend (http://localhost:10000)
- Basic middleware (helmet, morgan, express.json)
- Health check endpoint
- Error handling middleware

### **Phase 2: Database Integration (1-2 hours)**

#### **Task 2.1: Prisma Setup**
- Copy existing `prisma/schema.prisma` to backend
- Configure Prisma client
- Database connection testing
- Seed data verification

#### **Task 2.2: Database Services**
- User service (CRUD operations)
- Patient service
- Provider service
- Appointment service
- Consultation service
- Payment service

### **Phase 3: Authentication System (2-3 hours)**

#### **Task 3.1: JWT Implementation**
- JWT token generation
- Token verification middleware
- Refresh token mechanism
- Role-based authorization

#### **Task 3.2: Auth Endpoints**
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/reset-password
POST /api/auth/verify-reset-token
POST /api/auth/update-password
```

#### **Task 3.3: Password Security**
- bcrypt hashing
- Password validation
- Security best practices

### **Phase 4: Core API Endpoints (4-6 hours)**

#### **Task 4.1: User Management**
```
GET    /api/users/profile
PUT    /api/users/profile
DELETE /api/users/account
```

#### **Task 4.2: Patient Endpoints**
```
GET    /api/patients/:id
GET    /api/patients/user/:userId
PUT    /api/patients/:id/profile
GET    /api/patients/:id/medical-history
```

#### **Task 4.3: Provider Endpoints**
```
GET    /api/providers/:id
GET    /api/providers/user/:userId
GET    /api/providers
PUT    /api/providers/:id/profile
PUT    /api/providers/:id/availability
```

#### **Task 4.4: Appointment System**
```
POST   /api/appointments
GET    /api/appointments/:id
GET    /api/appointments/patient/:patientId
GET    /api/appointments/provider/:providerId
PUT    /api/appointments/:id/status
PUT    /api/appointments/:id/reschedule
```

### **Phase 5: Consultation & Video Calls (3-4 hours)**

#### **Task 5.1: Daily.co Integration**
- Room creation service
- Token generation for secure access
- Room management

#### **Task 5.2: Consultation Endpoints**
```
GET    /api/consultations/:id
GET    /api/consultations/appointment/:appointmentId
POST   /api/consultations/create-room/:appointmentId
GET    /api/consultations/:id/token/:userId
POST   /api/consultations/create/:appointmentId
PUT    /api/consultations/:id/status
PUT    /api/consultations/:id
```

### **Phase 6: Payment Processing (3-4 hours)**

#### **Task 6.1: Stripe Integration**
- Payment intent creation
- Payment confirmation
- Webhook handling
- Refund processing

#### **Task 6.2: Payment Endpoints**
```
POST   /api/payments/create-intent
POST   /api/payments/confirm
GET    /api/payments/patient/:patientId
GET    /api/payments/provider/:providerId
POST   /api/payments/refund
```

#### **Task 6.3: Multi-Provider Support**
- Paystack integration
- PayPal integration
- Payment method configuration

### **Phase 7: Admin Dashboard (2-3 hours)**

#### **Task 7.1: Admin Endpoints**
```
GET    /api/admin/users
GET    /api/admin/providers/pending
PUT    /api/admin/providers/:id/approve
PUT    /api/admin/providers/:id/reject
GET    /api/admin/stats
```

#### **Task 7.2: Analytics & Reporting**
- User statistics
- Appointment analytics
- Revenue tracking
- System health metrics

### **Phase 8: Notifications & Email (2-3 hours)**

#### **Task 8.1: Email Service**
- SMTP configuration
- Email templates
- Notification triggers

#### **Task 8.2: Notification Endpoints**
```
POST   /api/notifications
GET    /api/notifications/user/:userId
PUT    /api/notifications/:id/read
```

### **Phase 9: Testing & Validation (2-3 hours)**

#### **Task 9.1: Unit Tests**
- Service layer tests
- Controller tests
- Middleware tests

#### **Task 9.2: Integration Tests**
- API endpoint tests
- Database integration tests
- Authentication flow tests

#### **Task 9.3: End-to-End Testing**
- Frontend-backend integration
- Complete user flows
- Payment processing tests

### **Phase 10: Documentation & Deployment (1-2 hours)**

#### **Task 10.1: API Documentation**
- Endpoint documentation
- Request/response examples
- Error code documentation

#### **Task 10.2: Deployment Preparation**
- Environment configuration
- Production settings
- Security hardening

## 🔧 **DEVELOPMENT WORKFLOW**

### **Step 1: Setup**
```bash
# Create backend directory
mkdir backend
cd backend

# Initialize project
npm init -y

# Install dependencies
npm install express cors helmet morgan dotenv prisma @prisma/client bcryptjs jsonwebtoken joi

# Install dev dependencies
npm install -D nodemon jest supertest

# Copy Prisma schema
cp ../prisma/schema.prisma ./prisma/

# Setup basic structure
mkdir -p src/{controllers,middleware,routes,services,utils}
mkdir tests
```

### **Step 2: Environment Setup**
```bash
# Copy environment variables
cp ../.env ./

# Update for backend-specific settings
echo "PORT=3000" >> .env
echo "CORS_ORIGIN=http://localhost:10000" >> .env
```

### **Step 3: Development Commands**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  }
}
```

## ✅ **SUCCESS METRICS**

### **Technical Validation**
- [ ] All API endpoints respond with correct status codes
- [ ] Database operations complete successfully
- [ ] Authentication tokens work properly
- [ ] CORS allows frontend requests
- [ ] Error handling returns proper error messages

### **Functional Validation**
- [ ] User registration/login works from frontend
- [ ] Booking flow completes successfully
- [ ] Payment processing functions
- [ ] Video call rooms are created
- [ ] Admin dashboard displays real data

### **Performance Validation**
- [ ] API responses under 500ms
- [ ] Database queries optimized
- [ ] Memory usage reasonable
- [ ] No memory leaks detected

## 🚨 **CRITICAL REMINDERS**

1. **NEVER touch frontend files** - Only work in `backend/` directory
2. **Test with existing frontend** - Ensure compatibility
3. **Use existing database** - Don't modify schema
4. **Maintain API contracts** - Follow `docs/api-endpoints.md`
5. **Preserve environment variables** - Use existing configuration
