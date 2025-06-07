
import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';

const BookingConfirmation = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { bookingData } = location.state || {};
  
  // Redirect to booking page if accessed directly without data
  if (!bookingData) {
    return <Navigate to="/booking" replace />;
  }

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8 flex justify-center">
              <div className="h-20 w-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold mb-4 dark:text-medical-dark-text-primary">Booking Confirmed!</h1>
            <p className="mb-8 text-medical-neutral-600 dark:text-medical-dark-text-secondary">
              Thank you for booking your consultation with Dr. Fintan. You will receive an email confirmation shortly.
            </p>
            
            <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6 mb-8 text-left">
              <h2 className="text-xl font-semibold mb-4 dark:text-medical-dark-text-primary">Consultation Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-medical-primary/10 dark:bg-medical-accent/20 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">Date</p>
                    <p className="font-medium dark:text-medical-dark-text-primary">
                      {bookingData.date ? format(new Date(bookingData.date), 'PPP') : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-medical-primary/10 dark:bg-medical-accent/20 rounded-full flex items-center justify-center mr-3">
                    <Clock className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">Time</p>
                    <p className="font-medium dark:text-medical-dark-text-primary">{bookingData.time || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-medium mb-3 dark:text-medical-dark-text-primary">Consultation Type</h3>
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-6">
                  {bookingData.consultationType || 'Standard consultation'}
                </p>
                
                <h3 className="font-medium mb-3 dark:text-medical-dark-text-primary">Patient Information</h3>
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  {bookingData.patientName}<br />
                  {bookingData.patientEmail}<br />
                  {bookingData.patientPhone}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                Add to Calendar
              </Button>
              <Link to="/patient-dashboard">
                <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default BookingConfirmation;
