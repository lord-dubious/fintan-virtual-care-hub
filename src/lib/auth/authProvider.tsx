import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useRawAuth } from '@/hooks/useAuth';

// Create context with default values
const AuthContext = createContext<ReturnType<typeof useRawAuth> | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useRawAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

// HOC to protect routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: string[]
) => {
  const WithAuth = (props: P) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const [isAuthorized, setIsAuthorized] = useState(false);
    
    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          setIsAuthorized(false);
          // Redirect to login if not authenticated
          window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
        } else if (requiredRoles && requiredRoles.length > 0) {
          // Check for required roles
          const hasRequiredRole = user && requiredRoles.includes(user.role);
          setIsAuthorized(hasRequiredRole || false);
          
          if (!hasRequiredRole) {
            // Redirect to unauthorized page
            window.location.href = '/unauthorized';
          }
        } else {
          setIsAuthorized(true);
        }
      }
    }, [isAuthenticated, isLoading, user]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    return isAuthorized ? <Component {...props} /> : null;
  };

  return WithAuth;
};

export default AuthProvider; 