
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white py-4 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-medical-primary flex items-center justify-center text-white font-bold text-lg">F</div>
          <span className="font-semibold text-xl text-medical-primary">Dr. Fintan</span>
        </Link>
        
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="text-medical-neutral-600 hover:text-medical-primary font-medium">Home</Link>
          <Link to="/about" className="text-medical-neutral-600 hover:text-medical-primary font-medium">About</Link>
          <Link to="/services" className="text-medical-neutral-600 hover:text-medical-primary font-medium">Services</Link>
          <Link to="/faq" className="text-medical-neutral-600 hover:text-medical-primary font-medium">FAQs</Link>
          <Link to="/contact" className="text-medical-neutral-600 hover:text-medical-primary font-medium">Contact</Link>
          <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white">Book Consultation</Button>
        </div>
        
        <button className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6 text-medical-neutral-600" /> : <Menu className="h-6 w-6 text-medical-neutral-600" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white w-full py-4 px-4 shadow-md animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-medical-neutral-600 hover:text-medical-primary font-medium py-2" onClick={toggleMenu}>Home</Link>
            <Link to="/about" className="text-medical-neutral-600 hover:text-medical-primary font-medium py-2" onClick={toggleMenu}>About</Link>
            <Link to="/services" className="text-medical-neutral-600 hover:text-medical-primary font-medium py-2" onClick={toggleMenu}>Services</Link>
            <Link to="/faq" className="text-medical-neutral-600 hover:text-medical-primary font-medium py-2" onClick={toggleMenu}>FAQs</Link>
            <Link to="/contact" className="text-medical-neutral-600 hover:text-medical-primary font-medium py-2" onClick={toggleMenu}>Contact</Link>
            <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white w-full">Book Consultation</Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
