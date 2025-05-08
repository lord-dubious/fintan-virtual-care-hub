
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import ConsultationTypeStep from '@/components/booking/ConsultationTypeStep';
import DateTimeStep from '@/components/booking/DateTimeStep';
import PatientInfoStep from '@/components/booking/PatientInfoStep';
import PaymentStep from '@/components/booking/PaymentStep';

const BookingPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    consultationType: '',
    date: null,
    time: '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    dateOfBirth: null,
    reason: '',
    paymentMethod: 'card'
  });

  const totalSteps = 4;

  const updateBookingData = (data: Partial<typeof bookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Booking Successful",
      description: "Your appointment has been confirmed.",
    });
    navigate('/booking/confirmation', { state: { bookingData } });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ConsultationTypeStep 
          bookingData={bookingData} 
          updateBookingData={updateBookingData} 
        />;
      case 2:
        return <DateTimeStep 
          bookingData={bookingData} 
          updateBookingData={updateBookingData} 
        />;
      case 3:
        return <PatientInfoStep 
          bookingData={bookingData} 
          updateBookingData={updateBookingData} 
        />;
      case 4:
        return <PaymentStep 
          bookingData={bookingData} 
          updateBookingData={updateBookingData} 
          onSubmit={handleSubmit} 
        />;
      default:
        return <ConsultationTypeStep 
          bookingData={bookingData} 
          updateBookingData={updateBookingData} 
        />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 dark:text-medical-dark-text-primary">Book a Consultation</h1>
            
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                {[1, 2, 3, 4].map((step) => (
                  <div 
                    key={step} 
                    className={`flex-1 text-center ${step === currentStep ? 'font-semibold text-medical-primary dark:text-medical-accent' : 'text-medical-neutral-600 dark:text-medical-dark-text-secondary'}`}
                  >
                    Step {step}
                  </div>
                ))}
              </div>
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div 
                  className="absolute top-0 left-0 h-full bg-medical-primary dark:bg-medical-accent rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                <div>Type</div>
                <div>Schedule</div>
                <div>Info</div>
                <div>Payment</div>
              </div>
            </div>

            {/* Step content */}
            <div className="bg-white dark:bg-medical-dark-surface shadow-md rounded-lg p-6 mb-6">
              {renderStepContent()}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="dark:bg-transparent dark:text-medical-dark-text-primary dark:hover:bg-medical-primary/20"
              >
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90"
                >
                  Next Step
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default BookingPage;
