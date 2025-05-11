
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
import { Card } from "@/components/ui/card";
import { CheckCircle } from 'lucide-react';
import { cn } from "@/lib/utils";

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

  // Helper function to determine the step status
  const getStepStatus = (step: number) => {
    if (step === currentStep) return "current";
    if (step < currentStep) return "completed";
    return "upcoming";
  };

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 text-center">
              <h1 className="text-2xl md:text-3xl font-bold dark:text-medical-dark-text-primary">Book Your Consultation</h1>
              <p className="mt-2 text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                Complete the steps below to schedule your appointment
              </p>
            </div>
            
            {/* Step indicators */}
            <div className="mb-8">
              <div className="relative flex items-center justify-between">
                {[1, 2, 3, 4].map((step) => {
                  const status = getStepStatus(step);
                  return (
                    <div key={step} className="flex flex-col items-center relative z-10">
                      <div 
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all",
                          status === "completed" ? "bg-green-500 text-white" : 
                          status === "current" ? "bg-medical-primary dark:bg-medical-accent text-white dark:text-medical-dark-surface" : 
                          "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {status === "completed" ? <CheckCircle className="h-5 w-5" /> : step}
                      </div>
                      <span 
                        className={cn(
                          "mt-2 text-xs hidden md:block",
                          status === "completed" ? "text-green-600 dark:text-green-400" : 
                          status === "current" ? "text-medical-primary dark:text-medical-accent font-medium" : 
                          "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {step === 1 ? "Type" : step === 2 ? "Schedule" : step === 3 ? "Info" : "Payment"}
                      </span>
                    </div>
                  );
                })}
                {/* Progress line */}
                <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 -z-10">
                  <div 
                    className="absolute top-0 left-0 h-full bg-green-500 dark:bg-green-400 transition-all duration-300 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-medical-neutral-600 dark:text-medical-dark-text-secondary md:hidden">
                <div>Type</div>
                <div>Schedule</div>
                <div>Info</div>
                <div>Payment</div>
              </div>
            </div>

            {/* Step content */}
            <Card className="bg-white dark:bg-medical-dark-surface shadow-md rounded-xl p-6 mb-6 border-medical-border-light dark:border-medical-dark-border animate-fade-in">
              {renderStepContent()}
            </Card>

            {/* Navigation buttons */}
            {currentStep < totalSteps && (
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="dark:bg-transparent dark:text-medical-dark-text-primary dark:hover:bg-medical-primary/20 px-6"
                >
                  Back
                </Button>
                
                <Button 
                  onClick={handleNext}
                  className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 px-8"
                >
                  Continue
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default BookingPage;
