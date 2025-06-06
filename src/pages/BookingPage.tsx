
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import ConsultationTypeStep from '@/components/booking/ConsultationTypeStep';
import DateTimeStep from '@/components/booking/DateTimeStep';
import PatientInfoStep from '@/components/booking/PatientInfoStep';
import PaymentStep from '@/components/booking/PaymentStep';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingNavigation from '@/components/booking/BookingNavigation';
import BookingHeader from '@/components/booking/BookingHeader';
import { Card } from "@/components/ui/card";

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
            <BookingHeader totalSteps={totalSteps} />
            
            <BookingProgress 
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepTitles={stepTitles}
            />

            <Card className="bg-white dark:bg-medical-dark-surface shadow-lg rounded-xl p-6 mb-8 border-medical-border-light dark:border-medical-dark-border">
              {renderStepContent()}
            </Card>

            <BookingNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              isStepValid={isStepValid()}
              onPrevious={handlePrevious}
              onNext={handleNext}
            />
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default BookingPage;
