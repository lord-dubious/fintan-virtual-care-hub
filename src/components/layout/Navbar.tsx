import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Calendar, Info, Phone, ChevronRight, LogIn, UserPlus, User, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from '../theme/ThemeProvider';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { AuthModals } from '../auth/AuthModals.tsx';
import { PatientOnboarding } from '../onboarding/PatientOnboarding.tsx';
import ProfilePicture from '@/components/ui/ProfilePicture';

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ email: '', name: '' });
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginOpen = () => {
    setIsLoginOpen(true);
    setIsMenuOpen(false);
  };

  const handleSignupOpen = () => {
    setIsSignupOpen(true);
    setIsMenuOpen(false);
  };

  const handleSwitchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
  };

  const handleSignupSuccess = (email: string, name: string) => {
    setNewUserData({ email, name });
    setIsOnboardingOpen(true);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (user?.role === 'PATIENT') {
      navigate('/dashboard');
    } else if (user?.role === 'ADMIN') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'DOCTOR') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/dashboard'); // Default to patient dashboard
    }
    setIsMenuOpen(false);
  };

  // Mobile app-like bottom navigation and top bar
  if (isMobile) {
    return (
      <>
        {/* Mobile top nav bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-medical-dark-surface border-b border-medical-border-light dark:border-medical-dark-border h-16 flex items-center px-4 shadow-sm">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center text-white font-bold text-lg shadow-md">F</div>
            <span className="font-bold text-xl text-medical-primary dark:text-medical-accent">Dr. Fintan</span>
          </Link>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <button className="touch-target p-3 rounded-full bg-medical-bg-light dark:bg-medical-dark-surface/50 shadow-sm border border-medical-border-light dark:border-medical-dark-border" aria-label="Menu">
                  <Menu className="h-5 w-5 text-medical-neutral-600 dark:text-medical-dark-text-primary" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white dark:bg-medical-dark-surface border-medical-border-light dark:border-medical-dark-border w-[300px] px-4">
                <div className="flex items-center justify-between mb-6 mt-2 px-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center text-white font-bold text-lg">F</div>
                    <span className="font-semibold">Dr. Fintan</span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <Link to="/" className="flex items-center justify-between text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-3 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Home className="h-5 w-5" />
                      Home
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                  <Link to="/about" className="flex items-center justify-between text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-3 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5" />
                      About
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                  <Link to="/contact" className="flex items-center justify-between text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-3 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5" />
                      Contact
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                  <div className="border-t dark:border-gray-700 my-4"></div>
                  <Link to="/booking">
                    <Button className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 py-5">
                      Book a Consultation
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
        <div className="h-16"></div>
        
        {/* Mobile bottom navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-medical-dark-surface border-t border-medical-border-light dark:border-medical-dark-border flex items-center justify-around px-2 z-50">
          <Link to="/" className="flex flex-col items-center px-1">
            <Home className={`h-6 w-6 ${location.pathname === '/' ? 'text-medical-primary dark:text-medical-accent' : 'text-medical-neutral-500 dark:text-medical-dark-text-secondary'}`} />
            <span className={`text-xs mt-1 ${location.pathname === '/' ? 'text-medical-primary dark:text-medical-accent font-medium' : 'text-medical-neutral-500 dark:text-medical-dark-text-secondary'}`}>Home</span>
          </Link>
          <Link to="/booking" className="flex flex-col items-center">
            <div className="-mt-8 h-14 w-14 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <span className={`text-xs -mt-0.5 ${location.pathname === '/booking' ? 'text-medical-primary dark:text-medical-accent font-medium' : 'text-medical-neutral-500 dark:text-medical-dark-text-secondary'}`}>Book</span>
          </Link>
          <Link to="/about" className="flex flex-col items-center px-1">
            <Info className={`h-6 w-6 ${location.pathname === '/about' ? 'text-medical-primary dark:text-medical-accent' : 'text-medical-neutral-500 dark:text-medical-dark-text-secondary'}`} />
            <span className={`text-xs mt-1 ${location.pathname === '/about' ? 'text-medical-primary dark:text-medical-accent font-medium' : 'text-medical-neutral-500 dark:text-medical-dark-text-secondary'}`}>About</span>
          </Link>
          <Link to="/contact" className="flex flex-col items-center px-1">
            <Phone className={`h-6 w-6 ${location.pathname === '/contact' ? 'text-medical-primary dark:text-medical-accent' : 'text-medical-neutral-500 dark:text-medical-dark-text-secondary'}`} />
            <span className={`text-xs mt-1 ${location.pathname === '/contact' ? 'text-medical-primary dark:text-medical-accent font-medium' : 'text-medical-neutral-500 dark:text-medical-dark-text-secondary'}`}>Contact</span>
          </Link>
        </div>
        <div className="h-16"></div>
      </>
    );
  }

  // Desktop navigation - improved formatting
  return (
    <nav className="bg-white dark:bg-medical-dark-surface py-3 shadow-md sticky top-0 z-50 border-b border-medical-border-light dark:border-medical-dark-border">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">F</div>
          <span className="font-bold text-2xl text-medical-primary dark:text-medical-accent">Dr. Fintan</span>
        </Link>
        
        {/* Navigation Links */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium transition-colors px-3 py-2 rounded-md hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 ${
              location.pathname === '/' ? 'text-medical-primary dark:text-medical-accent bg-medical-bg-light dark:bg-medical-dark-surface/30' : ''
            }`}
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className={`text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium transition-colors px-3 py-2 rounded-md hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 ${
              location.pathname === '/about' ? 'text-medical-primary dark:text-medical-accent bg-medical-bg-light dark:bg-medical-dark-surface/30' : ''
            }`}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium transition-colors px-3 py-2 rounded-md hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 ${
              location.pathname === '/contact' ? 'text-medical-primary dark:text-medical-accent bg-medical-bg-light dark:bg-medical-dark-surface/30' : ''
            }`}
          >
            Contact
          </Link>
        </div>
        
        {/* Auth & Action Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          <ThemeToggle />

          {isAuthenticated ? (
            /* Authenticated User Menu */
            <div className="flex items-center space-x-3 border-r border-medical-border-light dark:border-medical-dark-border pr-4">
              <div className="flex items-center space-x-3">
                <ProfilePicture
                  user={user}
                  size="sm"
                  className="cursor-pointer hover:ring-2 hover:ring-medical-primary dark:hover:ring-medical-accent transition-all"
                />
                <span className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">
                  {user?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                onClick={handleProfileClick}
                className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 font-medium"
              >
                <User className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-medical-neutral-300 text-medical-neutral-600 hover:bg-medical-neutral-100 hover:text-medical-neutral-800 dark:border-medical-dark-border dark:text-medical-dark-text-primary dark:hover:bg-medical-dark-surface/50 font-medium transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            /* Auth Buttons for Non-Authenticated Users */
            <div className="flex items-center space-x-3 border-r border-medical-border-light dark:border-medical-dark-border pr-4">
              <Button
                variant="ghost"
                onClick={handleLoginOpen}
                className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 font-medium"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
              <Button
                variant="outline"
                onClick={handleSignupOpen}
                className="border-medical-primary text-medical-primary hover:bg-medical-primary hover:text-white dark:border-medical-accent dark:text-medical-accent dark:hover:bg-medical-accent dark:hover:text-white font-medium transition-all duration-200"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            </div>
          )}
          
          {/* CTA Button */}
          <Link to="/booking">
            <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 font-semibold px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
              <Calendar className="h-4 w-4 mr-2" />
              Book Consultation
            </Button>
          </Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          <ThemeToggle />
          <button 
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 transition-colors"
          >
            {isMenuOpen ? 
              <X className="h-6 w-6 text-medical-neutral-600 dark:text-medical-dark-text-primary" /> : 
              <Menu className="h-6 w-6 text-medical-neutral-600 dark:text-medical-dark-text-primary" />
            }
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-medical-dark-surface w-full py-6 px-6 shadow-lg animate-fade-in border-t border-medical-border-light dark:border-medical-dark-border">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-3 px-4 rounded-lg hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 transition-all" 
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-3 px-4 rounded-lg hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 transition-all" 
              onClick={toggleMenu}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-3 px-4 rounded-lg hover:bg-medical-bg-light dark:hover:bg-medical-dark-surface/50 transition-all" 
              onClick={toggleMenu}
            >
              Contact
            </Link>
            
            <div className="border-t dark:border-gray-700 my-4"></div>
            
            <div className="flex flex-col space-y-3">
              {isAuthenticated ? (
                /* Authenticated Mobile Menu */
                <>
                  <div className="text-center py-4 border-b border-medical-border-light dark:border-medical-dark-border mb-3">
                    <div className="flex flex-col items-center space-y-3">
                      <ProfilePicture
                        user={user}
                        size="lg"
                        className="cursor-pointer hover:ring-2 hover:ring-medical-primary dark:hover:ring-medical-accent transition-all"
                      />
                      <div>
                        <p className="text-medical-neutral-600 dark:text-medical-dark-text-primary font-medium">
                          {user?.name}
                        </p>
                        <p className="text-sm text-medical-neutral-400 dark:text-medical-dark-text-secondary">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-medical-primary text-medical-primary hover:bg-medical-primary hover:text-white dark:border-medical-accent dark:text-medical-accent dark:hover:bg-medical-accent dark:hover:text-white py-3"
                    onClick={handleProfileClick}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-medical-neutral-300 text-medical-neutral-600 hover:bg-medical-neutral-100 hover:text-medical-neutral-800 py-3"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                /* Non-Authenticated Mobile Menu */
                <>
                  <Button
                    variant="outline"
                    className="w-full border-medical-primary text-medical-primary hover:bg-medical-primary hover:text-white dark:border-medical-accent dark:text-medical-accent dark:hover:bg-medical-accent dark:hover:text-white py-3"
                    onClick={handleLoginOpen}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-medical-secondary text-medical-secondary hover:bg-medical-secondary hover:text-white py-3"
                    onClick={handleSignupOpen}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </>
              )}
              <Link to="/booking">
                <Button
                  className="bg-medical-primary hover:bg-medical-primary/90 text-white w-full dark:bg-medical-accent dark:hover:bg-medical-accent/90 py-3 font-semibold"
                  onClick={toggleMenu}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modals */}
      <AuthModals
        isLoginOpen={isLoginOpen}
        isSignupOpen={isSignupOpen}
        onLoginClose={() => setIsLoginOpen(false)}
        onSignupClose={() => setIsSignupOpen(false)}
        onSwitchToSignup={handleSwitchToSignup}
        onSwitchToLogin={handleSwitchToLogin}
        onSignupSuccess={handleSignupSuccess}
      />

      {/* Patient Onboarding Modal */}
      <PatientOnboarding
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        userEmail={newUserData.email}
        userName={newUserData.name}
      />
    </nav>
  );
};

export default Navbar;
