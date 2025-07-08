# Dr. Fintan Virtual Care Hub - Frontend-Backend Integration Implementation Plan

## 🎯 **PROJECT STATUS**

### **Branch Created**: `feat/frontend-backend-integration`
### **TaskMaster Project**: Initialized with 12 main tasks and 25 detailed subtasks
### **Current Tag**: `integration` (separate from main backend implementation)

## 📋 **DETAILED IMPLEMENTATION PLAN**

### **Phase 1: Foundation Setup (Tasks 1-2)**

#### **Task 1: Configure Frontend Environment for Backend Connectivity**
**Priority**: HIGH | **Dependencies**: None | **Subtasks**: 5

1. **Define Backend API URL in Frontend Configuration**
   - Create `src/api/config.ts` with `API_BASE_URL = http://localhost:3000`
   - Use environment variables for different environments

2. **Integrate Configured URL into Frontend API Client**
   - Update existing API client to use `API_BASE_URL`
   - Ensure all API calls use the configured endpoint

3. **Configure Backend CORS Policy for Frontend Origin**
   - Modify backend CORS to allow `http://localhost:10000`
   - Enable credentials for authentication

4. **Verify Security Headers and Network Request Flow**
   - Test initial API calls and inspect headers
   - Ensure no CORS or security errors

5. **Implement and Test Basic Frontend-Backend Connectivity**
   - Create test component for API connectivity
   - Verify end-to-end communication

#### **Task 2: Switch Frontend from Mock API to Real Backend API**
**Priority**: HIGH | **Dependencies**: Task 1 | **Subtasks**: 4

1. **Disable Mock API Flags and Review API Layer**
   - Change `USE_MOCK_API = true` to `false` in `src/api/auth.ts`
   - Review all files in `src/api/` for mock flags

2. **Configure API Client Base URL**
   - Ensure Axios instance points to real backend URL
   - Reference environment variables from Task 1

3. **Verify Critical API Endpoint Functionality**
   - Test login/logout, dashboard data, form submissions
   - Verify 200 OK responses and correct data

4. **Conduct Comprehensive Frontend Feature Regression Testing**
   - Test all features that interact with APIs
   - Ensure no regressions from mock to real backend

### **Phase 2: Authentication Integration (Tasks 3-4)**

#### **Task 3: Implement Real JWT Authentication Flow (Login/Register)**
**Priority**: HIGH | **Dependencies**: Task 2 | **Subtasks**: 6

1. **Configure Axios Instance and Base URL**
   - Set up dedicated Axios instance for API calls
   - Configure base URL for backend API endpoint

2. **Implement Real Login API Call**
   - Update login function to POST to `/auth/login`
   - Handle JWT token in response

3. **Implement Real Registration API Call**
   - Update register function to POST to `/auth/register`
   - Handle JWT token in response

4. **Implement JWT Token Storage and Retrieval**
   - Store tokens in localStorage/sessionStorage
   - Create helper functions for token management

5. **Create Axios Interceptor for Token Attachment**
   - Auto-attach Authorization header to requests
   - Handle cases where no token exists

6. **End-to-End Testing of Authentication Flow**
   - Test complete registration → login → protected resource flow
   - Verify token persistence and API access

#### **Task 4: Implement JWT Token Management and Role-Based Access Control**
**Priority**: HIGH | **Dependencies**: Task 3 | **Subtasks**: 5

1. **Implement Core JWT Storage Utilities**
   - Create `setAuthToken`, `getAuthToken`, `removeAuthToken`
   - Handle access and refresh tokens

2. **Configure Axios Request Interceptor for Authorization Header**
   - Auto-add `Authorization: Bearer <token>` header
   - Use token from storage utilities

3. **Develop Axios Response Interceptor for Token Refresh and Retry**
   - Handle 401/403 errors with token refresh
   - Retry original request with new token

4. **Implement User Role Storage and Retrieval**
   - Extract roles (PATIENT, PROVIDER, ADMIN) from login response
   - Store in centralized location (context/state)

5. **Create Role-Based Access Control (RBAC) Logic**
   - Create `useHasRole` hook or utility function
   - Enable conditional access based on user roles

### **Phase 3: Core Feature Integration (Tasks 5-8)**

#### **Task 5: Integrate Appointment Management APIs**
**Priority**: MEDIUM | **Dependencies**: Task 4 | **Subtasks**: 5

1. **Configure API Client and Authentication Interceptors**
   - Set up authenticated Axios instance
   - Ensure JWT tokens are attached to requests

2. **Implement Core Appointment CRUD (Create & Read)**
   - Replace mock `createAppointment` with real POST
   - Replace mock `getAppointments` with real GET

3. **Implement Appointment Lifecycle Management (Update & Cancel)**
   - Replace mock `updateAppointmentStatus` with real PUT/PATCH
   - Replace mock `cancelAppointment` with real DELETE/PATCH

4. **Refine Data Fetching for Calendar Integration**
   - Add date range filtering to appointment queries
   - Optimize for calendar view performance

5. **Integrate APIs with UI Components and Implement Error Handling**
   - Connect API functions to UI components
   - Add loading states, success notifications, error handling

#### **Tasks 6-8: Additional Core Integrations**
- **Task 6**: Patient Dashboard APIs (Medium Priority)
- **Task 7**: Admin Portal APIs (Medium Priority)  
- **Task 8**: Password Reset Functionality (Medium Priority)

### **Phase 4: Advanced Features (Tasks 9-10)**

#### **Task 9: Integrate Consultation System with Daily.co**
**Priority**: MEDIUM | **Dependencies**: Task 5
- Replace mock consultation logic with real Daily.co API
- Implement room creation and management
- Handle consultation lifecycle

#### **Task 10: Integrate Payment Processing with Stripe/Paystack**
**Priority**: MEDIUM | **Dependencies**: Task 5
- Connect to real payment providers via backend
- Implement transaction history and billing
- Handle payment success/failure flows

### **Phase 5: Validation (Tasks 11-12)**

#### **Task 11: Comprehensive Integration Testing**
**Priority**: HIGH | **Dependencies**: Task 10
- Test all API endpoints with real backend
- Verify database operations and authentication
- Validate error handling and edge cases

#### **Task 12: End-to-End User Workflow Validation**
**Priority**: HIGH | **Dependencies**: Task 11
- Test complete user journeys
- Validate registration → consultation → payment flow
- Ensure seamless user experience

## 🚨 **CRITICAL CONSTRAINTS**

### **Frontend Protection Rules**
- ❌ **NEVER modify** files in `src/pages/` directory
- ❌ **NEVER change** `src/components/` UI components
- ❌ **NEVER alter** `src/App.tsx` or routing configuration
- ❌ **NEVER modify** `package.json`, `vite.config.ts`, or build configs
- ✅ **ONLY modify** API integration layer in `src/api/` directory

### **Integration Requirements**
- Backend API endpoints must match frontend expectations
- Response formats must be compatible with frontend code
- Error handling must match frontend error processing
- Authentication flow must work with existing frontend logic

## 📊 **PROGRESS TRACKING**

### **Current Status**
- **Total Tasks**: 12 main tasks
- **Total Subtasks**: 25 detailed subtasks
- **Completion**: 0% (Ready to start)
- **Current Phase**: Phase 1 - Foundation Setup

### **Next Immediate Steps**
1. Start Task 1.1: Define Backend API URL in Frontend Configuration
2. Verify backend server is running on port 3000
3. Test basic connectivity between frontend and backend
4. Begin systematic integration following the task sequence

## 🎯 **SUCCESS CRITERIA**

### **Technical Success**
- All frontend pages load and function with real backend
- User authentication works with real database users
- All CRUD operations work through real API endpoints
- Performance remains acceptable with real backend integration

### **User Experience Success**
- No visible changes to existing UI components or layouts
- All existing functionality continues to work as expected
- Loading states and error messages display appropriately
- System feels responsive with real backend integration

## 🚀 **DEPLOYMENT READINESS**

Once integration is complete:
1. Frontend will seamlessly connect to real backend APIs
2. Real authentication with JWT tokens and role-based access
3. Real database data flowing through the system
4. All existing UI functionality preserved exactly as-is
5. Production-ready telemedicine platform

---

**Implementation Status**: Ready to begin Phase 1
**Next Action**: Execute Task 1.1 - Define Backend API URL in Frontend Configuration
