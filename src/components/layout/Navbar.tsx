
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X, Home, User, Calendar, Info, Phone, Settings } from "lucide-react";
import { Link } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from '../theme/ThemeProvider';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Mobile app-like bottom navigation and top bar
  if (isMobile) {
    return (
      <>
        {/* Mobile top nav bar - simplified */}
        <nav className="mobile-nav-bar">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-medical-primary flex items-center justify-center text-white font-bold text-lg">F</div>
            <span className="font-semibold text-xl text-medical-primary dark:text-medical-accent">Dr. Fintan</span>
          </Link>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <button className="touch-target" aria-label="Menu">
                  <Menu className="h-6 w-6 text-medical-neutral-600 dark:text-medical-dark-text-primary" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white dark:bg-medical-dark-surface border-medical-border-light dark:border-medical-dark-border">
                <div className="flex items-center justify-between mb-6 mt-2">
                  <h3 className="font-semibold text-lg">Menu</h3>
                  <ThemeToggle /> {/* Moved theme toggle here */}
                </div>
                <div className="flex flex-col gap-6">
                  <Link to="/" className="flex items-center gap-3 text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2">
                    <Home className="h-5 w-5" />
                    Home
                  </Link>
                  <Link to="/about" className="flex items-center gap-3 text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2">
                    <Info className="h-5 w-5" />
                    About
                  </Link>
                  <Link to="/services" className="flex items-center gap-3 text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2">
                    <User className="h-5 w-5" />
                    Services
                  </Link>
                  <Link to="/faq" className="flex items-center gap-3 text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2">
                    <Info className="h-5 w-5" />
                    FAQs
                  </Link>
                  <Link to="/contact" className="flex items-center gap-3 text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2">
                    <Phone className="h-5 w-5" />
                    Contact
                  </Link>
                  <Link to="/booking">
                    <Button className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white mt-4">Book Consultation</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
        
        {/* Mobile bottom navigation */}
        <div className="mobile-bottom-nav">
          <Link to="/" className="flex flex-col items-center px-2 py-1">
            <Home className="h-6 w-6 text-medical-primary dark:text-medical-accent" />
            <span className="text-xs mt-1 text-medical-neutral-600 dark:text-medical-dark-text-primary">Home</span>
          </Link>
          <Link to="/services" className="flex flex-col items-center px-2 py-1">
            <User className="h-6 w-6 text-medical-neutral-600 dark:text-medical-dark-text-primary" />
            <span className="text-xs mt-1 text-medical-neutral-600 dark:text-medical-dark-text-primary">Services</span>
          </Link>
          <Link to="/booking" className="flex flex-col items-center px-2 py-1">
            <div className="-mt-5 h-14 w-14 rounded-full bg-medical-primary dark:bg-medical-accent flex items-center justify-center shadow-lg">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <span className="text-xs mt-1 text-medical-neutral-600 dark:text-medical-dark-text-primary">Book</span>
          </Link>
          <Link to="/about" className="flex flex-col items-center px-2 py-1">
            <Info className="h-6 w-6 text-medical-neutral-600 dark:text-medical-dark-text-primary" />
            <span className="text-xs mt-1 text-medical-neutral-600 dark:text-medical-dark-text-primary">About</span>
          </Link>
          <Link to="/contact" className="flex flex-col items-center px-2 py-1">
            <Phone className="h-6 w-6 text-medical-neutral-600 dark:text-medical-dark-text-primary" />
            <span className="text-xs mt-1 text-medical-neutral-600 dark:text-medical-dark-text-primary">Contact</span>
          </Link>
        </div>
      </>
    );
  }

  // Desktop navigation - only shown on desktop
  return (
    <nav className="bg-white dark:bg-medical-dark-surface py-4 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-medical-primary flex items-center justify-center text-white font-bold text-lg">F</div>
          <span className="font-semibold text-xl text-medical-primary dark:text-medical-accent">Dr. Fintan</span>
        </Link>
        
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium">Home</Link>
          <Link to="/about" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium">About</Link>
          <Link to="/services" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium">Services</Link>
          <Link to="/faq" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium">FAQs</Link>
          <Link to="/contact" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium">Contact</Link>
          <ThemeToggle />
          <Link to="/booking">
            <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white">Book Consultation</Button>
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
            <Link to="/services" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2" onClick={toggleMenu}>Services</Link>
            <Link to="/faq" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2" onClick={toggleMenu}>FAQs</Link>
            <Link to="/contact" className="text-medical-neutral-600 hover:text-medical-primary dark:text-medical-dark-text-primary dark:hover:text-medical-accent font-medium py-2" onClick={toggleMenu}>Contact</Link>
            <Link to="/booking">
              <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white w-full" onClick={toggleMenu}>Book Consultation</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
