
import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import AppointmentConfirmation from '@/components/booking/AppointmentConfirmation';

const BookingConfirmation = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { bookingData } = location.state || {};
  
  // Redirect to booking page if accessed directly without data
  if (!bookingData) {
    return <Navigate to="/booking" replace />;
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 ${isMobile ? 'px-3 py-4' : 'px-4 py-8'}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mt-4' : 'mt-8'}`}>
        <div className={`${isMobile ? 'max-w-full' : 'container mx-auto max-w-3xl'}`}>
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <div className="h-16 w-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-4 dark:text-white`}>
              Booking Confirmed!
            </h1>
            <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-base'} mb-6`}>
              Thank you for booking your consultation with Dr. Fintan. You will receive an email confirmation shortly.
            </p>
          </div>
          
          {/* Show calendar integration only if payment is completed */}
          {bookingData.paymentCompleted && bookingData.selectedDate && bookingData.selectedTime && (
            <div className="mb-8">
              <AppointmentConfirmation
                selectedDate={bookingData.selectedDate}
                selectedTime={bookingData.selectedTime}
              />
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border-0 dark:border-gray-700 mb-8">
            <div className={`${isMobile ? 'p-4' : 'p-6'}`}>
              <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-4 dark:text-white`}>
                Consultation Details
              </h2>
              
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-2 gap-6'}`}>
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
                      Date
                    </p>
                    <p className={`font-medium dark:text-white ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {bookingData.selectedDate ? format(new Date(bookingData.selectedDate), 'PPP') : 'Not specified'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mr-3">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400`}>
                      Time
                    </p>
                    <p className={`font-medium dark:text-white ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {bookingData.selectedTime || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 space-y-4`}>
                <div>
                  <h3 className={`font-medium mb-2 dark:text-white ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Consultation Type
                  </h3>
                  <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
                    {bookingData.consultationType === 'video' ? 'Video Consultation' : 
                     bookingData.consultationType === 'audio' ? 'Audio Consultation' : 
                     'Standard consultation'}
                  </p>
                </div>
                
                <div>
                  <h3 className={`font-medium mb-2 dark:text-white ${isMobile ? 'text-sm' : 'text-base'}`}>
                    Patient Information
                  </h3>
                  <div className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-base'} space-y-1`}>
                    <p>{bookingData.patientInfo?.firstName} {bookingData.patientInfo?.lastName}</p>
                    <p>{bookingData.patientInfo?.email}</p>
                    <p>{bookingData.patientInfo?.phone}</p>
                  </div>
                </div>

                {bookingData.patientInfo?.reason && (
                  <div>
                    <h3 className={`font-medium mb-2 dark:text-white ${isMobile ? 'text-sm' : 'text-base'}`}>
                      Reason for Consultation
                    </h3>
                    <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
                      {bookingData.patientInfo.reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row gap-4'} justify-center`}>
            <Link to="/consultation">
              <Button className={`${isMobile ? 'w-full h-10 text-sm' : 'h-11'} bg-blue-600 hover:bg-blue-700 text-white`}>
                Join Video Call
              </Button>
            </Link>
            <Link to="/">
              <Button 
                variant="outline" 
                className={`${isMobile ? 'w-full h-10 text-sm' : 'h-11'} dark:bg-transparent dark:text-white dark:border-gray-600 dark:hover:bg-gray-700`}
              >
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default BookingConfirmation;
