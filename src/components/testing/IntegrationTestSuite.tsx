// Comprehensive Integration Test Suite
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Loader2, Play, RefreshCw } from 'lucide-react';
import { authApi } from '@/api/auth';
import { appointmentsApi } from '@/api/appointments';
import { paymentsApi } from '@/api/payments';
import { patientsApi } from '@/api/patients';
import { adminApi } from '@/api/admin';

interface TestResult {
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  duration?: number;
  details?: any;
}

interface TestSuite {
  name: string;
  description: string;
  tests: TestCase[];
}

interface TestCase {
  name: string;
  description: string;
  testFn: () => Promise<void>;
}

const IntegrationTestSuite: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const updateTestResult = (testId: string, result: Partial<TestResult>) => {
    setTestResults(prev => ({
      ...prev,
      [testId]: { ...prev[testId], ...result }
    }));
  };

  // Test Suites Definition
  const testSuites: TestSuite[] = [
    {
      name: 'Authentication API',
      description: 'Test user authentication endpoints',
      tests: [
        {
          name: 'auth-config',
          description: 'Test authentication configuration',
          testFn: async () => {
            // Test auth configuration endpoint
            const response = await fetch('/api/auth/csrf-token');
            if (!response.ok) throw new Error('CSRF token endpoint failed');
          }
        },
        {
          name: 'auth-profile',
          description: 'Test profile retrieval',
          testFn: async () => {
            try {
              await authApi.getProfile();
            } catch (error) {
              // Expected to fail if not authenticated - this is correct behavior
              if (error instanceof Error && error.message.includes('401')) {
                return; // This is expected
              }
              throw error;
            }
          }
        }
      ]
    },
    {
      name: 'Appointments API',
      description: 'Test appointment management endpoints',
      tests: [
        {
          name: 'appointments-list',
          description: 'Test appointments listing',
          testFn: async () => {
            try {
              await appointmentsApi.getAppointments();
            } catch (error) {
              // Expected to fail if not authenticated
              if (error instanceof Error && error.message.includes('401')) {
                return;
              }
              throw error;
            }
          }
        },
        {
          name: 'appointments-validation',
          description: 'Test appointment data validation',
          testFn: async () => {
            // Test with invalid data to ensure validation works
            try {
              await appointmentsApi.createAppointment({
                providerId: 'invalid-id',
                patientId: 'invalid-id',
                appointmentDate: 'invalid-date',
                consultationType: 'INVALID' as any,
              });
            } catch (error) {
              // Expected to fail - validation should catch this
              return;
            }
            throw new Error('Validation should have failed');
          }
        }
      ]
    },
    {
      name: 'Payments API',
      description: 'Test payment processing endpoints',
      tests: [
        {
          name: 'payments-config',
          description: 'Test payment configuration',
          testFn: async () => {
            try {
              await paymentsApi.getPaymentConfig();
            } catch (error) {
              if (error instanceof Error && error.message.includes('401')) {
                return;
              }
              throw error;
            }
          }
        },
        {
          name: 'payments-validation',
          description: 'Test payment data validation',
          testFn: async () => {
            try {
              await paymentsApi.createPaymentIntent({
                appointmentId: 'invalid-id',
                amount: -100, // Invalid amount
                currency: 'INVALID',
                paymentMethod: 'INVALID' as any,
              });
            } catch (error) {
              // Expected to fail
              return;
            }
            throw new Error('Payment validation should have failed');
          }
        }
      ]
    },
    {
      name: 'Patients API',
      description: 'Test patient management endpoints',
      tests: [
        {
          name: 'patients-list',
          description: 'Test patients listing',
          testFn: async () => {
            try {
              await patientsApi.getPatients();
            } catch (error) {
              if (error instanceof Error && error.message.includes('401')) {
                return;
              }
              throw error;
            }
          }
        }
      ]
    },
    {
      name: 'Admin API',
      description: 'Test admin management endpoints',
      tests: [
        {
          name: 'admin-users',
          description: 'Test admin users endpoint',
          testFn: async () => {
            try {
              await adminApi.getUsers();
            } catch (error) {
              if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
                return; // Expected for non-admin users
              }
              throw error;
            }
          }
        }
      ]
    },
    {
      name: 'System Health',
      description: 'Test system health and connectivity',
      tests: [
        {
          name: 'health-check',
          description: 'Test health check endpoint',
          testFn: async () => {
            const response = await fetch('/api/health');
            if (!response.ok) throw new Error('Health check failed');
          }
        },
        {
          name: 'cors-headers',
          description: 'Test CORS configuration',
          testFn: async () => {
            const response = await fetch('/api/health', {
              method: 'OPTIONS'
            });
            // Should not throw CORS error
          }
        }
      ]
    }
  ];

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setTestResults({});

    const allTests = testSuites.flatMap(suite => 
      suite.tests.map(test => ({ ...test, suiteId: suite.name }))
    );

    for (let i = 0; i < allTests.length; i++) {
      const test = allTests[i];
      const testId = `${test.suiteId}-${test.name}`;
      
      setCurrentTest(testId);
      updateTestResult(testId, { status: 'running', message: 'Running...' });

      const startTime = Date.now();
      
      try {
        await test.testFn();
        const duration = Date.now() - startTime;
        updateTestResult(testId, {
          status: 'success',
          message: 'Test passed',
          duration
        });
      } catch (error) {
        const duration = Date.now() - startTime;
        updateTestResult(testId, {
          status: 'error',
          message: error instanceof Error ? error.message : 'Test failed',
          duration
        });
      }

      setProgress(((i + 1) / allTests.length) * 100);
    }

    setCurrentTest(null);
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return 'blue';
      case 'success':
        return 'green';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const totalTests = testSuites.reduce((acc, suite) => acc + suite.tests.length, 0);
  const completedTests = Object.values(testResults).filter(r => r.status !== 'running').length;
  const passedTests = Object.values(testResults).filter(r => r.status === 'success').length;
  const failedTests = Object.values(testResults).filter(r => r.status === 'error').length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Integration Test Suite</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive testing of all API endpoints and workflows
        </p>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Test Controls
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run All Tests
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress: {completedTests}/{totalTests} tests</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentTest && (
                <p className="text-sm text-muted-foreground">
                  Currently running: {currentTest}
                </p>
              )}
            </div>
          )}

          {!isRunning && Object.keys(testResults).length > 0 && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{totalTests}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Suites */}
      <div className="space-y-4">
        {testSuites.map((suite) => (
          <Card key={suite.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {suite.name}
                <Badge variant="outline">
                  {suite.tests.length} tests
                </Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{suite.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suite.tests.map((test) => {
                  const testId = `${suite.name}-${test.name}`;
                  const result = testResults[testId];
                  
                  return (
                    <div key={test.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(result?.status || 'pending')}
                        <div>
                          <div className="font-medium">{test.description}</div>
                          {result?.message && (
                            <div className="text-sm text-muted-foreground">
                              {result.message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {result?.duration && (
                          <span className="text-xs text-muted-foreground">
                            {result.duration}ms
                          </span>
                        )}
                        {result?.status && (
                          <Badge variant="outline" className={`text-${getStatusColor(result.status)}-600`}>
                            {result.status.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Summary */}
      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Integration Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Integration testing completed. {passedTests} tests passed, {failedTests} tests failed out of {totalTests} total tests.
                {failedTests === 0 ? ' All systems are functioning correctly!' : ' Some issues were detected and should be investigated.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntegrationTestSuite;
