
import React from 'react';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-medical-neutral-600 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-medical-primary font-bold text-lg">F</div>
              <span className="font-semibold text-xl">Dr. Fintan</span>
            </div>
            <p className="text-medical-bg-light/80 mb-4">
              Providing accessible virtual healthcare consultations with personalized care and professional expertise.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-medical-accent" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-white hover:text-medical-accent" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-medical-accent" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-medical-bg-light/80 hover:text-medical-accent transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-medical-bg-light/80 hover:text-medical-accent transition-colors">About Dr. Fintan</Link></li>
              <li><Link to="/services" className="text-medical-bg-light/80 hover:text-medical-accent transition-colors">Our Services</Link></li>
              <li><Link to="/faq" className="text-medical-bg-light/80 hover:text-medical-accent transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="text-medical-bg-light/80 hover:text-medical-accent transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Our Services</h4>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-medical-bg-light/80 hover:text-medical-accent transition-colors">Video Consultations</Link></li>
              <li><Link to="/services" className="text-medical-bg-light/80 hover:text-medical-accent transition-colors">Audio Consultations</Link></li>
              <li><Link to="/services" className="text-medical-bg-light/80 hover:text-medical-accent transition-colors">Follow-up Appointments</Link></li>
              <li><Link to="/services" className="text-medical-bg-light/80 hover:text-medical-accent transition-colors">Prescription Renewals</Link></li>
            </ul>
          </div>
          
          {/* Column 4: Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact Information</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Phone size={20} className="mr-2 flex-shrink-0 text-medical-accent" />
                <span className="text-medical-bg-light/80">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <Mail size={20} className="mr-2 flex-shrink-0 text-medical-accent" />
                <span className="text-medical-bg-light/80">contact@drfintan.com</span>
              </li>
              <li className="flex items-start">
                <MapPin size={20} className="mr-2 flex-shrink-0 text-medical-accent" />
                <span className="text-medical-bg-light/80">Virtual Practice<br/>Available Worldwide</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-medical-bg-light/20 mt-8 pt-6 text-center text-medical-bg-light/60 text-sm">
          <p>&copy; {new Date().getFullYear()} Dr. Fintan Virtual Care Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
