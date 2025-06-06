
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingNavigation from '@/components/booking/BookingNavigation';
import BookingHeader from '@/components/booking/BookingHeader';
import ConsultationTypeStep from '@/components/booking/ConsultationTypeStep';
import DateTimeStep from '@/components/booking/DateTimeStep';
import PatientInfoStep from '@/components/booking/PatientInfoStep';
import PaymentStep from '@/components/booking/PaymentStep';
import { useIsMobile } from '@/hooks/use-mobile';

export interface BookingData {
  consultationType: 'video' | 'audio' | '';
  selectedDate: Date | null;
  selectedTime: string;
  patientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    reason: string;
  };
  paymentMethod: string;
}

const BookingPage: React.FC = () => {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  const [bookingData, setBookingData] = useState<BookingData>({
    consultationType: '',
    selectedDate: null,
    selectedTime: '',
    patientInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      reason: ''
    },
    paymentMethod: ''
  });

  const stepTitles = ['Type', 'Date & Time', 'Your Info', 'Payment'];

  const updateBookingData = (field: keyof BookingData, value: any) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return bookingData.consultationType !== '';
      case 2:
        return bookingData.selectedDate !== null && bookingData.selectedTime !== '';
      case 3:
        const { firstName, lastName, email, phone, reason } = bookingData.patientInfo;
        return Boolean(firstName && lastName && email && phone && reason);
      case 4:
        return bookingData.paymentMethod !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConsultationTypeStep
            consultationType={bookingData.consultationType}
            onTypeSelect={(type) => updateBookingData('consultationType', type)}
          />
        );
      case 2:
        return (
          <DateTimeStep
            date={bookingData.selectedDate}
            time={bookingData.selectedTime}
            onDateSelect={(date) => updateBookingData('selectedDate', date)}
            onTimeSelect={(time) => updateBookingData('selectedTime', time)}
          />
        );
      case 3:
        return (
          <PatientInfoStep
            firstName={bookingData.patientInfo.firstName}
            lastName={bookingData.patientInfo.lastName}
            email={bookingData.patientInfo.email}
            phone={bookingData.patientInfo.phone}
            dateOfBirth={bookingData.patientInfo.dateOfBirth}
            reason={bookingData.patientInfo.reason}
            onInfoChange={(info) => updateBookingData('patientInfo', info)}
          />
        );
      case 4:
        return (
          <PaymentStep
            consultationType={bookingData.consultationType}
            date={bookingData.selectedDate || new Date()}
            time={bookingData.selectedTime}
            paymentMethod={bookingData.paymentMethod}
            onMethodSelect={(method) => updateBookingData('paymentMethod', method)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-medical-primary/5 to-medical-accent/5 dark:from-medical-primary/10 dark:to-medical-accent/10 ${isMobile ? 'mobile-app-container' : ''}`}>
      <div className={`container mx-auto px-4 py-8 ${isMobile ? 'mobile-content' : ''}`}>
        <div className="max-w-4xl mx-auto">
          <BookingHeader totalSteps={totalSteps} />
          
          <Card className="shadow-xl">
            <CardContent className="p-6 md:p-8">
              <BookingProgress
                currentStep={currentStep}
                totalSteps={totalSteps}
                stepTitles={stepTitles}
              />
              
              <div className="mt-8">
                {renderStep()}
              </div>
              
              <div className="mt-8">
                <BookingNavigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  isStepValid={validateStep(currentStep)}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
