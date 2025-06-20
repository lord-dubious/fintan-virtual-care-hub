# Augment Memory Rules - Dr. Fintan Virtual Care Hub

## 🚨 **CRITICAL UI PROTECTION RULES**

### **NEVER MODIFY THESE FILES/DIRECTORIES:**
```
❌ src/                    - Complete frontend code
❌ src/pages/              - All page components  
❌ src/components/         - All UI components
❌ src/App.tsx             - Main app component
❌ src/main.tsx            - App entry point
❌ src/index.css           - Global styles
❌ package.json            - Frontend dependencies
❌ vite.config.ts          - Frontend build config
❌ tsconfig.json           - TypeScript config
❌ tailwind.config.ts      - Styling config
❌ postcss.config.js       - CSS processing
```

### **FRONTEND STATUS: 100% COMPLETE ✅**
- **URL**: http://localhost:10000/
- **Status**: Fully functional and visible
- **Pages**: Home, About, Services, Booking, Admin, Contact
- **Features**: Navigation, routing, booking flow, payment UI, admin portal
- **Styling**: Complete with Tailwind CSS, responsive design
- **Authentication UI**: Login/register forms, OAuth buttons

### **BACKEND STATUS: MISSING ❌**
- **Required**: Separate Node.js/Express API server
- **Location**: Create new `backend/` directory
- **Port**: 3000 (frontend expects API at localhost:3000)
- **Database**: Existing Neon PostgreSQL (configured)

## 🎯 **DEVELOPMENT APPROACH**

### **Frontend-Backend Separation**
```
Project Structure:
├── src/                 ← FRONTEND (DO NOT TOUCH)
├── package.json         ← FRONTEND (DO NOT TOUCH)  
├── vite.config.ts       ← FRONTEND (DO NOT TOUCH)
└── backend/             ← CREATE THIS (BACKEND ONLY)
    ├── src/
    ├── package.json
    └── server.js
```

### **When User Asks for Changes:**

#### **✅ ALLOWED ACTIONS:**
- Create new `backend/` directory
- Add backend API endpoints
- Configure database services
- Set up authentication middleware
- Add payment processing
- Create admin API endpoints
- Add email/notification services
- Write backend tests
- Update backend documentation

#### **❌ FORBIDDEN ACTIONS:**
- Modifying any file in `src/` directory
- Changing frontend package.json
- Updating vite.config.ts
- Modifying React components
- Changing routing configuration
- Updating UI styling
- Modifying frontend authentication
- Changing frontend API client code

### **Problem-Solving Approach:**

#### **If Frontend Issue Reported:**
1. **First**: Verify the issue exists by testing the URL
2. **Check**: Browser console for JavaScript errors
3. **Investigate**: Network requests to backend API
4. **Solution**: Fix backend API, never frontend code

#### **If Integration Issue:**
1. **Backend Fix**: Update API endpoints to match frontend expectations
2. **Environment**: Check CORS configuration
3. **Database**: Verify database connection and data
4. **Never**: Modify frontend API client code

#### **If UI Not Working:**
1. **Check**: Development server is running (npm run dev)
2. **Verify**: Correct port (10000 for frontend, 3000 for backend)
3. **Test**: API endpoints are responding
4. **Never**: Modify React components or styling

## 📋 **STANDARD RESPONSES**

### **When Asked to Fix Frontend:**
```
"The frontend is complete and functional. The issue is likely 
with the missing backend API server. Let me create the backend 
endpoints that the frontend is expecting."
```

### **When Asked to Modify UI:**
```
"The UI is fully implemented and working. Instead, I'll create 
the backend API that will provide the data and functionality 
the UI needs."
```

### **When Asked About Broken Pages:**
```
"The pages are rendering correctly. The issue is that the 
backend API server is not running. Let me create the missing 
API endpoints."
```

## 🔧 **TECHNICAL GUIDELINES**

### **API Development:**
- **Base URL**: http://localhost:3000/api
- **CORS**: Must allow http://localhost:10000
- **Authentication**: JWT tokens as expected by frontend
- **Response Format**: JSON matching frontend API client expectations
- **Error Handling**: Proper HTTP status codes

### **Database Integration:**
- **Use**: Existing Neon PostgreSQL connection
- **Schema**: Use existing Prisma schema (don't modify)
- **Services**: Create backend services for database operations
- **Migrations**: Only if absolutely necessary and documented

### **Environment Variables:**
- **Copy**: Existing .env to backend directory
- **Modify**: Only backend-specific variables
- **Preserve**: All existing frontend environment variables

## 🎯 **SUCCESS CRITERIA**

### **Frontend Validation:**
- [ ] All pages load at http://localhost:10000/
- [ ] Navigation works between pages
- [ ] UI components render correctly
- [ ] Styling is preserved
- [ ] No JavaScript errors in console

### **Backend Integration:**
- [ ] API server runs on http://localhost:3000
- [ ] CORS allows frontend requests
- [ ] Authentication endpoints work
- [ ] Database operations succeed
- [ ] Frontend can communicate with backend

### **End-to-End Validation:**
- [ ] User can register/login from frontend
- [ ] Booking flow works completely
- [ ] Payment processing functions
- [ ] Admin dashboard shows real data
- [ ] All integrations working

## 🚨 **EMERGENCY PROTOCOLS**

### **If Frontend Breaks:**
1. **STOP**: Do not modify any frontend files
2. **REVERT**: Any recent changes to frontend files
3. **INVESTIGATE**: Check if backend API is causing issues
4. **FIX**: Backend API to match frontend expectations

### **If Asked to "Fix Everything":**
1. **CLARIFY**: Specific functionality that's not working
2. **IDENTIFY**: Whether it's frontend display or backend data
3. **FOCUS**: On creating missing backend functionality
4. **PRESERVE**: All existing frontend code

### **If Confused About Architecture:**
1. **REMEMBER**: Frontend is complete, backend is missing
2. **REFERENCE**: BACKEND_PRD.md and BACKEND_IMPLEMENTATION_PLAN.md
3. **FOLLOW**: Phase-by-phase backend implementation
4. **NEVER**: Assume frontend needs changes

## 📞 **QUICK REFERENCE**

### **Current Working URLs:**
- **Frontend**: http://localhost:10000/
- **Backend**: http://localhost:3000/ (TO BE CREATED)
- **Database**: Neon PostgreSQL (CONFIGURED)

### **Key Files to Reference:**
- `BACKEND_PRD.md` - Product requirements
- `BACKEND_IMPLEMENTATION_PLAN.md` - Implementation steps
- `docs/api-endpoints.md` - API specifications
- `docs/database-schema.md` - Database structure

### **Emergency Contacts:**
- **Frontend Issues**: Check browser console, verify server running
- **Backend Issues**: Create missing API endpoints
- **Database Issues**: Check Neon connection, verify Prisma schema
- **Integration Issues**: Fix CORS, verify API contracts
