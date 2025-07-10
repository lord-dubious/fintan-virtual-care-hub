import React from "react";
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
  if (requiredRole) {
    const hasAccess =
      user?.role === requiredRole ||
      (requiredRole === 'DOCTOR' && user?.role === 'PROVIDER');

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on user role
      if (user?.role === 'ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (user?.role === 'DOCTOR' || user?.role === 'PROVIDER') {
        return <Navigate to="/doctor/dashboard" replace />;
      } else {
        return <Navigate to="/patient/dashboard" replace />;
      }
    }
  }

  // User is authenticated and has the required role (if any)
  return <>{children}</>;
};

export default ProtectedRoute;

