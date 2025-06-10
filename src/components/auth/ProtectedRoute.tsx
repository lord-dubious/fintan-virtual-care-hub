
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/authProvider';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'PATIENT' | 'PROVIDER' | 'ADMIN';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
