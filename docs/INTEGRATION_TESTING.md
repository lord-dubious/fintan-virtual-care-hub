# Integration Testing Documentation

## Overview

This document outlines the comprehensive integration testing strategy for the Fintan Virtual Care Hub application. The testing suite covers API endpoints, database operations, payment processing, and end-to-end workflows.

## Testing Components

### 1. Integration Test Suite (`src/components/testing/IntegrationTestSuite.tsx`)

Comprehensive testing of all API endpoints and workflows:

- **Authentication API**: Login, registration, profile management
- **Appointments API**: Booking, management, status updates
- **Payments API**: Payment processing, configuration, validation
- **Patients API**: Patient data management
- **Admin API**: Administrative functions
- **System Health**: Health checks and CORS configuration

### 2. Database Integration Test (`src/components/testing/DatabaseIntegrationTest.tsx`)

Database connectivity and operations testing:

- **Connection Testing**: Verify database connectivity
- **Table Operations**: Test CRUD operations on all tables
- **Schema Validation**: Ensure data validation works
- **Transaction Support**: Verify transaction handling

### 3. Payment Integration Test (`src/components/payments/PaymentIntegrationTest.tsx`)

Payment processing integration testing:

- **Payment Configuration**: Test payment method setup
- **Payment Intent Creation**: Stripe integration testing
- **Status Polling**: Payment status monitoring
- **Error Handling**: Payment failure scenarios

### 4. API Testing Utilities (`src/utils/apiTesting.ts`)

Utility classes for automated API testing:

- **ApiTester**: Individual endpoint testing
- **WorkflowTester**: End-to-end workflow testing
- **Test Reporting**: Automated test result generation

## Test Categories

### Authentication Tests

```typescript
// Test authentication endpoints
- POST /api/auth/login (with/without credentials)
- POST /api/auth/register (with/without valid data)
- GET /api/auth/profile (with/without authentication)
- POST /api/auth/refresh-token (token validation)
- GET /api/auth/csrf-token (CSRF protection)
```

### Appointment Tests

```typescript
// Test appointment management
- GET /api/appointments (list appointments)
- POST /api/appointments (create appointment)
- PUT /api/appointments/:id (update appointment)
- DELETE /api/appointments/:id (cancel appointment)
- GET /api/appointments/:id (get appointment details)
```

### Payment Tests

```typescript
// Test payment processing
- GET /api/payments/config (payment configuration)
- POST /api/payments/intent (create payment intent)
- POST /api/payments/confirm (confirm payment)
- GET /api/payments/:id (get payment details)
- POST /api/payments/webhook (webhook handling)
```

### Database Tests

```typescript
// Test database operations
- Connection verification
- Table accessibility
- Schema validation
- Transaction support
- Data integrity
```

## Running Tests

### Manual Testing

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Navigate to test components**:
   - Integration Test Suite: `/test/integration`
   - Database Test: `/test/database`
   - Payment Test: `/test/payments`

3. **Run individual test suites**:
   - Click "Run All Tests" in each component
   - Monitor test results and response times
   - Review detailed error messages

### Automated Testing

```typescript
import { apiTester, workflowTester } from '@/utils/apiTesting';

// Test all endpoints
const results = await apiTester.testAllEndpoints();

// Test specific workflows
const workflows = await workflowTester.testAllWorkflows();

// Generate report
const report = apiTester.generateTestReport(results);
console.log(report);
```

## Test Scenarios

### 1. User Registration Flow

```typescript
1. POST /api/auth/register (invalid data) → 400 Bad Request
2. POST /api/auth/register (valid data) → 201 Created
3. GET /api/auth/profile (with token) → 200 OK
4. POST /api/auth/logout → 200 OK
```

### 2. Appointment Booking Flow

```typescript
1. GET /api/appointments (without auth) → 401 Unauthorized
2. POST /api/auth/login (valid credentials) → 200 OK
3. GET /api/appointments (with auth) → 200 OK
4. POST /api/appointments (valid data) → 201 Created
5. GET /api/appointments/:id → 200 OK
```

### 3. Payment Processing Flow

```typescript
1. POST /api/payments/intent (without auth) → 401 Unauthorized
2. POST /api/auth/login → 200 OK
3. POST /api/payments/intent (valid data) → 201 Created
4. POST /api/payments/confirm → 200 OK
5. GET /api/payments/:id → 200 OK
```

## Expected Results

### Success Criteria

- **API Endpoints**: All endpoints respond with expected status codes
- **Authentication**: Proper 401/403 responses for protected routes
- **Validation**: 400 responses for invalid data
- **Database**: All tables accessible and operations working
- **Payments**: Payment configuration loaded and processing functional

### Performance Benchmarks

- **Response Time**: < 500ms for most endpoints
- **Database Queries**: < 100ms for simple operations
- **Payment Processing**: < 2s for payment intent creation
- **Health Check**: < 50ms response time

## Error Handling

### Common Issues

1. **Database Connection Errors**:
   - Check DATABASE_URL environment variable
   - Verify Neon PostgreSQL connection
   - Run `npx prisma migrate deploy`

2. **Authentication Errors**:
   - Verify JWT_SECRET configuration
   - Check cookie settings
   - Validate CSRF token implementation

3. **Payment Integration Errors**:
   - Verify Stripe API keys
   - Check webhook endpoint configuration
   - Validate payment method setup

### Debugging Steps

1. **Check Environment Variables**:
   ```bash
   # Verify all required environment variables are set
   echo $DATABASE_URL
   echo $JWT_SECRET
   echo $STRIPE_SECRET_KEY
   ```

2. **Test Database Connection**:
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

3. **Verify API Endpoints**:
   ```bash
   curl -X GET http://localhost:3000/api/health
   ```

## Continuous Integration

### Automated Testing Pipeline

```yaml
# Example GitHub Actions workflow
name: Integration Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run integration tests
        run: npm run test:integration
```

### Test Coverage Goals

- **API Endpoints**: 100% coverage of all routes
- **Database Operations**: All CRUD operations tested
- **Payment Flows**: All payment scenarios covered
- **Error Handling**: All error conditions tested

## Monitoring and Alerts

### Health Check Monitoring

```typescript
// Continuous health monitoring
setInterval(async () => {
  const isHealthy = await runQuickHealthCheck();
  if (!isHealthy) {
    // Send alert
    console.error('Health check failed');
  }
}, 60000); // Check every minute
```

### Performance Monitoring

```typescript
// Track API response times
const results = await testCriticalEndpoints();
const slowEndpoints = results.filter(r => r.responseTime > 1000);
if (slowEndpoints.length > 0) {
  console.warn('Slow endpoints detected:', slowEndpoints);
}
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Data Cleanup**: Clean up test data after each run
3. **Environment Separation**: Use separate test database
4. **Error Logging**: Log all test failures with details
5. **Regular Execution**: Run tests on every deployment

## Conclusion

The integration testing suite provides comprehensive coverage of all application components, ensuring reliability and performance. Regular execution of these tests helps maintain system health and catch issues early in the development cycle.
