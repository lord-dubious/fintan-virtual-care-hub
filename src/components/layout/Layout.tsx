import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  
  // Create a handler for logout button click
  const handleLogout = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    logout();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">Dr. Fintan Virtual Care</Link>
          
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="hover:text-primary-foreground/80">Home</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-primary-foreground/80">Dashboard</Link>
                <Link to="/appointments" className="hover:text-primary-foreground/80">Appointments</Link>
                
                {user?.role === 'PATIENT' && (
                  <Link to="/patient/records" className="hover:text-primary-foreground/80">My Records</Link>
                )}
                
                {user?.role === 'PROVIDER' && (
                  <Link to="/provider/schedule" className="hover:text-primary-foreground/80">My Schedule</Link>
                )}
                
                {user?.role === 'ADMIN' && (
                  <Link to="/admin/dashboard" className="hover:text-primary-foreground/80">Admin</Link>
                )}
              </>
            ) : (
              <>
                <Link to="/auth/login" className="hover:text-primary-foreground/80">Login</Link>
                <Link to="/auth/register" className="hover:text-primary-foreground/80">Register</Link>
              </>
            )}
          </nav>
          
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              <span className="hidden md:inline">{user?.name}</span>
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-primary-foreground text-primary rounded-md hover:bg-primary-foreground/90"
              >
                Logout
              </button>
            </div>
          )}
          
          {/* Mobile menu button - to be implemented */}
          <button className="md:hidden">
            <span className="sr-only">Open menu</span>
            {/* Icon would go here */}
          </button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                &copy; {new Date().getFullYear()} Dr. Fintan Virtual Care Hub. All rights reserved.
              </p>
            </div>
            
            <div className="flex space-x-4">
              <Link to="/privacy" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

