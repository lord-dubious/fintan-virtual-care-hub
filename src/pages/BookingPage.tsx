
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
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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

  const handleSubmit = () => {
    console.log('Booking submitted:', bookingData);
    navigate('/booking/confirmation');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ConsultationTypeStep
            selectedType={bookingData.consultationType}
            onTypeSelect={(type) => updateBookingData('consultationType', type)}
          />
        );
      case 2:
        return (
          <DateTimeStep
            bookingData={{
              date: bookingData.selectedDate,
              time: bookingData.selectedTime
            }}
            updateBookingData={(data) => {
              if (data.date !== undefined) updateBookingData('selectedDate', data.date);
              if (data.time !== undefined) updateBookingData('selectedTime', data.time);
            }}
          />
        );
      case 3:
        return (
          <PatientInfoStep
            bookingData={{
              patientName: `${bookingData.patientInfo.firstName} ${bookingData.patientInfo.lastName}`.trim(),
              patientEmail: bookingData.patientInfo.email,
              patientPhone: bookingData.patientInfo.phone,
              dateOfBirth: bookingData.patientInfo.dateOfBirth ? new Date(bookingData.patientInfo.dateOfBirth) : null,
              reason: bookingData.patientInfo.reason
            }}
            updateBookingData={(data) => {
              const updates: any = {};
              if (data.patientName !== undefined) {
                const [firstName, ...lastNameParts] = data.patientName.split(' ');
                updates.firstName = firstName || '';
                updates.lastName = lastNameParts.join(' ') || '';
              }
              if (data.patientEmail !== undefined) updates.email = data.patientEmail;
              if (data.patientPhone !== undefined) updates.phone = data.patientPhone;
              if (data.dateOfBirth !== undefined) updates.dateOfBirth = data.dateOfBirth?.toISOString() || '';
              if (data.reason !== undefined) updates.reason = data.reason;
              
              updateBookingData('patientInfo', { ...bookingData.patientInfo, ...updates });
            }}
          />
        );
      case 4:
        return (
          <PaymentStep
            bookingData={{
              consultationType: bookingData.consultationType,
              date: bookingData.selectedDate,
              time: bookingData.selectedTime,
              paymentMethod: bookingData.paymentMethod
            }}
            updateBookingData={(data) => updateBookingData('paymentMethod', data.paymentMethod)}
            onSubmit={handleSubmit}
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
