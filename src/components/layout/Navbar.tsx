
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Home, Calendar, Info, Phone, ChevronRight } from "lucide-react";
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from '../theme/ThemeProvider';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Mobile app-like bottom navigation and top bar
  if (isMobile) {
    return (
      <>
        {/* Mobile top nav bar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-medical-dark-surface border-b border-medical-border-light dark:border-medical-dark-border h-14 flex items-center px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center text-white font-bold text-lg">F</div>
            <span className="font-semibold text-xl text-medical-primary dark:text-medical-accent">Dr. Fintan</span>
          </Link>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <button className="touch-target p-2 rounded-full bg-medical-bg-light dark:bg-medical-dark-surface/50" aria-label="Menu">
                  <Menu className="h-5 w-5 text-medical-neutral-600 dark:text-medical-dark-text-primary" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white dark:bg-medical-dark-surface border-medical-border-light dark:border-medical-dark-border w-[280px] px-2">
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
        <div className="h-14"></div>
        
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

  // Desktop navigation - simplified
  return (
    <nav className="bg-white dark:bg-medical-dark-surface py-4 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-medical-primary to-medical-secondary flex items-center justify-center text-white font-bold text-lg">F</div>
          <span className="font-semibold text-xl text-medical-primary dark:text-medical-accent">Dr. Fintan</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium">
            Home
          </Link>
          <Link to="/about" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium">
            About
          </Link>
          <Link to="/contact" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium">
            Contact
          </Link>
          <ThemeToggle />
          <Link to="/booking">
            <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">Book Consultation</Button>
          </Link>
        </div>
        
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6 text-medical-neutral-600 dark:text-medical-dark-text-primary" /> : <Menu className="h-6 w-6 text-medical-neutral-600 dark:text-medical-dark-text-primary" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-medical-dark-surface w-full py-4 px-4 shadow-md animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2" onClick={toggleMenu}>Home</Link>
            <Link to="/about" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2" onClick={toggleMenu}>About</Link>
            <Link to="/contact" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2" onClick={toggleMenu}>Contact</Link>
            <Link to="/booking">
              <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white w-full dark:bg-medical-accent dark:hover:bg-medical-accent/90" onClick={toggleMenu}>Book Consultation</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
