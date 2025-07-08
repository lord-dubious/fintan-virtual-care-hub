// API Testing Utilities
import { API_ENDPOINTS } from '@/api/config';

export interface ApiTestResult {
  endpoint: string;
  method: string;
  status: 'success' | 'error' | 'warning';
  statusCode?: number;
  responseTime: number;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiTestConfig {
  timeout?: number;
  expectedStatus?: number;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
}

export class ApiTester {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string = '', timeout: number = 5000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = timeout;
  }

  async testEndpoint(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    config: ApiTestConfig = {}
  ): Promise<ApiTestResult> {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: config.body ? JSON.stringify(config.body) : undefined,
        signal: AbortSignal.timeout(config.timeout || this.defaultTimeout),
      });

      const responseTime = Date.now() - startTime;
      const expectedStatus = config.expectedStatus || (method === 'POST' ? 201 : 200);

      let status: 'success' | 'error' | 'warning' = 'success';
      let message = `${method} ${endpoint} completed`;

      if (response.status !== expectedStatus) {
        if (response.status === 401 || response.status === 403) {
          status = 'warning';
          message = `Authentication required (${response.status})`;
        } else {
          status = 'error';
          message = `Unexpected status code: ${response.status}`;
        }
      }

      return {
        endpoint,
        method,
        status,
        statusCode: response.status,
        responseTime,
        message,
        details: {
          headers: Object.fromEntries(response.headers.entries()),
          ok: response.ok,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint,
        method,
        status: 'error',
        responseTime,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: { error },
      };
    }
  }

  async testAllEndpoints(): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];

    // Test Authentication endpoints
    const authTests = [
      { endpoint: API_ENDPOINTS.AUTH.LOGIN, method: 'POST' as const, expectedStatus: 400 }, // Should fail without credentials
      { endpoint: API_ENDPOINTS.AUTH.REGISTER, method: 'POST' as const, expectedStatus: 400 }, // Should fail without data
      { endpoint: API_ENDPOINTS.AUTH.PROFILE, method: 'GET' as const, expectedStatus: 401 }, // Should require auth
      { endpoint: API_ENDPOINTS.AUTH.REFRESH_TOKEN, method: 'POST' as const, expectedStatus: 401 }, // Should require auth
    ];

    for (const test of authTests) {
      const result = await this.testEndpoint(test.endpoint, test.method, {
        expectedStatus: test.expectedStatus,
      });
      results.push(result);
    }

    // Test Appointment endpoints
    const appointmentTests = [
      { endpoint: API_ENDPOINTS.APPOINTMENTS.BASE, method: 'GET' as const, expectedStatus: 401 },
      { endpoint: API_ENDPOINTS.APPOINTMENTS.BASE, method: 'POST' as const, expectedStatus: 401 },
    ];

    for (const test of appointmentTests) {
      const result = await this.testEndpoint(test.endpoint, test.method, {
        expectedStatus: test.expectedStatus,
      });
      results.push(result);
    }

    // Test Payment endpoints
    const paymentTests = [
      { endpoint: API_ENDPOINTS.PAYMENTS.BASE, method: 'GET' as const, expectedStatus: 401 },
      { endpoint: API_ENDPOINTS.PAYMENTS.INTENT, method: 'POST' as const, expectedStatus: 401 },
      { endpoint: API_ENDPOINTS.PAYMENTS.CONFIG, method: 'GET' as const, expectedStatus: 401 },
    ];

    for (const test of paymentTests) {
      const result = await this.testEndpoint(test.endpoint, test.method, {
        expectedStatus: test.expectedStatus,
      });
      results.push(result);
    }

    // Test Patient endpoints
    const patientTests = [
      { endpoint: API_ENDPOINTS.PATIENTS.BASE, method: 'GET' as const, expectedStatus: 401 },
    ];

    for (const test of patientTests) {
      const result = await this.testEndpoint(test.endpoint, test.method, {
        expectedStatus: test.expectedStatus,
      });
      results.push(result);
    }

    // Test Admin endpoints
    const adminTests = [
      { endpoint: API_ENDPOINTS.ADMIN.USERS, method: 'GET' as const, expectedStatus: 401 },
      { endpoint: API_ENDPOINTS.ADMIN.APPOINTMENTS, method: 'GET' as const, expectedStatus: 401 },
      { endpoint: API_ENDPOINTS.ADMIN.STATISTICS, method: 'GET' as const, expectedStatus: 401 },
    ];

    for (const test of adminTests) {
      const result = await this.testEndpoint(test.endpoint, test.method, {
        expectedStatus: test.expectedStatus,
      });
      results.push(result);
    }

    // Test Health endpoint
    const healthResult = await this.testEndpoint(API_ENDPOINTS.HEALTH, 'GET', {
      expectedStatus: 200,
    });
    results.push(healthResult);

    return results;
  }

  generateTestReport(results: ApiTestResult[]): string {
    const successCount = results.filter(r => r.status === 'success').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const totalCount = results.length;

    const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalCount;

    let report = `API Integration Test Report\n`;
    report += `================================\n\n`;
    report += `Total Endpoints Tested: ${totalCount}\n`;
    report += `Successful: ${successCount}\n`;
    report += `Warnings: ${warningCount}\n`;
    report += `Errors: ${errorCount}\n`;
    report += `Average Response Time: ${avgResponseTime.toFixed(2)}ms\n\n`;

    report += `Detailed Results:\n`;
    report += `-----------------\n`;

    results.forEach(result => {
      const statusIcon = result.status === 'success' ? '✅' : 
                        result.status === 'warning' ? '⚠️' : '❌';
      
      report += `${statusIcon} ${result.method} ${result.endpoint}\n`;
      report += `   Status: ${result.statusCode || 'N/A'} | Time: ${result.responseTime}ms\n`;
      report += `   Message: ${result.message}\n\n`;
    });

    return report;
  }
}

// Workflow testing utilities
export class WorkflowTester {
  private apiTester: ApiTester;

  constructor(baseUrl: string = '') {
    this.apiTester = new ApiTester(baseUrl);
  }

  async testUserRegistrationFlow(): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];

    // Test registration with invalid data
    const invalidRegResult = await this.apiTester.testEndpoint(
      API_ENDPOINTS.AUTH.REGISTER,
      'POST',
      {
        expectedStatus: 400,
        body: { email: 'invalid-email' }, // Invalid data
      }
    );
    results.push(invalidRegResult);

    return results;
  }

  async testAppointmentBookingFlow(): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];

    // Test appointment creation without auth
    const noAuthResult = await this.apiTester.testEndpoint(
      API_ENDPOINTS.APPOINTMENTS.BASE,
      'POST',
      {
        expectedStatus: 401,
        body: {
          providerId: 'test-provider',
          appointmentDate: new Date().toISOString(),
          consultationType: 'VIDEO',
        },
      }
    );
    results.push(noAuthResult);

    return results;
  }

  async testPaymentProcessingFlow(): Promise<ApiTestResult[]> {
    const results: ApiTestResult[] = [];

    // Test payment intent creation without auth
    const noAuthResult = await this.apiTester.testEndpoint(
      API_ENDPOINTS.PAYMENTS.INTENT,
      'POST',
      {
        expectedStatus: 401,
        body: {
          appointmentId: 'test-appointment',
          amount: 100,
          currency: 'USD',
          paymentMethod: 'STRIPE',
        },
      }
    );
    results.push(noAuthResult);

    return results;
  }

  async testAllWorkflows(): Promise<{ [workflow: string]: ApiTestResult[] }> {
    const workflows = {
      'User Registration': await this.testUserRegistrationFlow(),
      'Appointment Booking': await this.testAppointmentBookingFlow(),
      'Payment Processing': await this.testPaymentProcessingFlow(),
    };

    return workflows;
  }
}

// Export singleton instances
export const apiTester = new ApiTester();
export const workflowTester = new WorkflowTester();

// Utility functions
export const runQuickHealthCheck = async (): Promise<boolean> => {
  try {
    const result = await apiTester.testEndpoint(API_ENDPOINTS.HEALTH);
    return result.status === 'success';
  } catch {
    return false;
  }
};

export const testCriticalEndpoints = async (): Promise<ApiTestResult[]> => {
  const criticalEndpoints = [
    { endpoint: API_ENDPOINTS.HEALTH, method: 'GET' as const },
    { endpoint: API_ENDPOINTS.AUTH.LOGIN, method: 'POST' as const, expectedStatus: 400 },
    { endpoint: API_ENDPOINTS.PAYMENTS.CONFIG, method: 'GET' as const, expectedStatus: 401 },
  ];

  const results: ApiTestResult[] = [];
  
  for (const test of criticalEndpoints) {
    const result = await apiTester.testEndpoint(test.endpoint, test.method, {
      expectedStatus: test.expectedStatus,
    });
    results.push(result);
  }

  return results;
};
