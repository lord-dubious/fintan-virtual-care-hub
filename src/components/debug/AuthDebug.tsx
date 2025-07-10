import React from "react";
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>🔍 Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}
        </div>
        <div>
          <strong>Is Loading:</strong> {isLoading ? '⏳ Yes' : '✅ No'}
        </div>
        {user ? (
          <div className="space-y-2">
            <div><strong>User ID:</strong> {user.id}</div>
            <div><strong>Name:</strong> {user.name}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Role:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.role}</span></div>
            <div><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</div>
          </div>
        ) : (
          <div>
            <strong>User:</strong> null
          </div>
        )}
        
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <strong>Expected Redirects:</strong>
          <ul className="mt-2 text-sm space-y-1">
            <li>• PATIENT → /dashboard</li>
            <li>• PROVIDER → /doctor/dashboard</li>
            <li>• DOCTOR → /doctor/dashboard</li>
            <li>• ADMIN → /admin/dashboard</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebug;
