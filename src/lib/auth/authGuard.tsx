import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authProvider';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('PATIENT' | 'PROVIDER' | 'ADMIN')[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  allowedRoles = ['PATIENT', 'PROVIDER', 'ADMIN'] 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // If still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If user doesn't have the required role, redirect to unauthorized
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and has the required role, render the children
  return <>{children}</>;
};

export const RoleGuard: React.FC<{ 
  children: React.ReactNode; 
  role: 'PATIENT' | 'PROVIDER' | 'ADMIN';
}> = ({ children, role }) => {
  const { hasRole, loading } = useAuth();

  // If still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center h-12">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user doesn't have the required role, don't render the children
  if (!hasRole(role)) {
    return null;
  }

  // If user has the required role, render the children
  return <>{children}</>;
};

