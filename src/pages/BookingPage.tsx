
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
import { CheckCircle, ArrowLeft } from 'lucide-react';
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
  const stepTitles = ['Consultation Type', 'Date & Time', 'Your Information', 'Payment'];

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
      description: "Your appointment has been confirmed. You'll receive confirmation details shortly.",
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

  const getStepStatus = (step: number) => {
    if (step === currentStep) return "current";
    if (step < currentStep) return "completed";
    return "upcoming";
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return bookingData.consultationType !== '';
      case 2:
        return bookingData.date && bookingData.time;
      case 3:
        return bookingData.patientName && bookingData.patientEmail && bookingData.patientPhone;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="mb-4 text-medical-neutral-600 dark:text-medical-dark-text-secondary hover:text-medical-primary dark:hover:text-medical-accent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-3xl md:text-4xl font-bold dark:text-medical-dark-text-primary">
                Book with Dr. Fintan Ekochin
              </h1>
              <p className="mt-2 text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                Complete your consultation booking in {totalSteps} simple steps
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {stepTitles.map((title, index) => {
                  const stepNumber = index + 1;
                  const status = getStepStatus(stepNumber);
                  return (
                    <div key={stepNumber} className="flex flex-col items-center relative z-10 flex-1">
                      <div 
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all mb-2",
                          status === "completed" ? "bg-green-500 text-white" : 
                          status === "current" ? "bg-medical-primary dark:bg-medical-accent text-white dark:text-medical-dark-surface" : 
                          "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {status === "completed" ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                      </div>
                      <span 
                        className={cn(
                          "text-xs text-center max-w-24",
                          status === "completed" ? "text-green-600 dark:text-green-400" : 
                          status === "current" ? "text-medical-primary dark:text-medical-accent font-medium" : 
                          "text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {title}
                      </span>
                    </div>
                  );
                })}
              </div>
              {/* Progress line */}
              <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-500 rounded transition-all duration-300 ease-in-out"
                  style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Step Content */}
            <Card className="bg-white dark:bg-medical-dark-surface shadow-lg rounded-xl p-6 mb-8 border-medical-border-light dark:border-medical-dark-border">
              {renderStepContent()}
            </Card>

            {/* Navigation */}
            {currentStep < totalSteps && (
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="dark:bg-transparent dark:text-medical-dark-text-primary dark:hover:bg-medical-primary/20 px-8"
                >
                  Previous
                </Button>
                
                <Button 
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 px-8"
                >
                  {currentStep === totalSteps - 1 ? 'Review & Pay' : 'Continue'}
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
