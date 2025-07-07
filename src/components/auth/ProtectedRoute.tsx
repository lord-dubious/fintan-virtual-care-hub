import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'PROVIDER' | 'PATIENT' | 'DOCTOR';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check role requirements if specified
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to dashboard if authenticated but wrong role
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and has the required role (if any)
  return <>{children}</>;
};

export default ProtectedRoute;

