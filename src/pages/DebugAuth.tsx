import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { API_BASE_URL } from '@/api/config';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/api/auth';

const DebugAuth: React.FC = () => {
  const { user, isAuthenticated, login, isLoading } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);

  const addTestResult = (test: string, result: any, success: boolean) => {
    setTestResults(prev => [...prev, {
      test,
      result: typeof result === 'object' ? JSON.stringify(result, null, 2) : result,
      success,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testAPIConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
      const data = await response.json();
      addTestResult('API Health Check', data, response.ok);
    } catch (error) {
      addTestResult('API Health Check', error.message, false);
    }
  };

  const testLogin = async () => {
    try {
      const response = await authApi.login({
        email: 'chukwurahdavid@gmail.com',
        password: 'Sinead12.'
      });
      addTestResult('Login Test', response, response.success);
    } catch (error) {
      addTestResult('Login Test', error.message, false);
    }
  };

  const testRegister = async () => {
    try {
      const response = await authApi.register({
        name: 'Test User Debug',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
        role: 'PATIENT'
      });
      addTestResult('Register Test', response, response.success);
    } catch (error) {
      addTestResult('Register Test', error.message, false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              🔧 Authentication Debug Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Configuration Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configuration</h3>
                <div className="bg-gray-100 p-4 rounded-lg space-y-2">
                  <div><strong>API Base URL:</strong> {API_BASE_URL}</div>
                  <div><strong>Current URL:</strong> {window.location.href}</div>
                  <div><strong>Environment:</strong> {import.meta.env.MODE}</div>
                  <div><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || 'Not set'}</div>
                  <div><strong>VITE_API_BASE_URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'Not set'}</div>
                </div>
              </div>

              {/* Authentication Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Authentication Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={isAuthenticated ? "default" : "secondary"}>
                      {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                    </Badge>
                    {isLoading && <Badge variant="outline">Loading...</Badge>}
                  </div>
                  {user && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div><strong>Name:</strong> {user.name}</div>
                      <div><strong>Email:</strong> {user.email}</div>
                      <div><strong>Role:</strong> {user.role}</div>
                      <div><strong>ID:</strong> {user.id}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button onClick={testAPIConnection} variant="outline">
                Test API Connection
              </Button>
              <Button onClick={testLogin} variant="outline">
                Test Login (Existing User)
              </Button>
              <Button onClick={testRegister} variant="outline">
                Test Registration
              </Button>
              <Button onClick={() => setTestResults([])} variant="secondary">
                Clear Results
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{result.test}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "Success" : "Failed"}
                        </Badge>
                        <span className="text-sm text-gray-500">{result.timestamp}</span>
                      </div>
                    </div>
                    <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                      {result.result}
                    </pre>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">For Patient Login:</h4>
                <p className="text-blue-700">Use the "Login" button in the navigation bar on the homepage</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800">For Admin Login:</h4>
                <p className="text-purple-700">Go to <code>/auth/login</code> for administrative access</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Test Account:</h4>
                <p className="text-green-700">
                  Email: <code>chukwurahdavid@gmail.com</code><br/>
                  Password: <code>Sinead12.</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugAuth;
