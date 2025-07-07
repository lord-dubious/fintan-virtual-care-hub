
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import BookingProgress from '@/components/booking/BookingProgress';
import BookingNavigation from '@/components/booking/BookingNavigation';
import BookingHeader from '@/components/booking/BookingHeader';
import ConsultationTypeStep from '@/components/booking/ConsultationTypeStep';
import DateTimeStep from '@/components/booking/DateTimeStep';
import PatientInfoStep from '@/components/booking/PatientInfoStep';
import PaymentStep from '@/components/booking/PaymentStep';
import SimpleSignOn from '@/components/booking/SimpleSignOn';
import NewBookingCalendar from '@/components/booking/NewBookingCalendar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePatientProfileForBooking } from '@/hooks/usePatientProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
    reasonAudio?: string;
  };
  paymentMethod: string;
  isAuthenticated: boolean;
  userEmail: string;
}

const BookingPage: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();

  // Get patient profile data for auto-population
  const {
    formData,
    isProfileComplete
  } = usePatientProfileForBooking();

  // Determine initial step based on authentication status
  const [currentStep, setCurrentStep] = useState(0);
  const [useNewBooking, setUseNewBooking] = useState(true); // Toggle for new booking system

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
      reason: '',
      reasonAudio: ''
    },
    paymentMethod: '',
    isAuthenticated: false,
    userEmail: ''
  });

  // Calculate total steps based on authentication status
  const totalSteps = (isAuthenticated || bookingData.isAuthenticated) ? 4 : 5; // Dynamic based on auth state

  // Update booking data when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setBookingData(prev => ({
        ...prev,
        isAuthenticated: true,
        userEmail: user.email,
        patientInfo: {
          ...prev.patientInfo,
          email: user.email,
          firstName: user.name?.split(' ')[0] || '',
          lastName: user.name?.split(' ').slice(1).join(' ') || ''
        }
      }));

      // Skip authentication step if user is already logged in
      if (currentStep === 0) {
        setCurrentStep(1);
      }
    } else if (!isLoading) {
      // Reset to auth step if not authenticated
      setBookingData(prev => ({
        ...prev,
        isAuthenticated: false,
        userEmail: '',
        patientInfo: {
          ...prev.patientInfo,
          email: '',
          firstName: '',
          lastName: ''
        }
      }));
      setCurrentStep(0);
    }
  }, [isAuthenticated, user, isLoading, currentStep]);

  // Auto-populate patient info from profile when available
  useEffect(() => {
    if (formData && isProfileComplete && !bookingData.patientInfo.firstName) {
      // Split the full name into first and last name
      const nameParts = formData.patientName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setBookingData(prev => ({
        ...prev,
        patientInfo: {
          ...prev.patientInfo,
          firstName,
          lastName,
          email: formData.patientEmail || prev.patientInfo.email,
          phone: formData.patientPhone || prev.patientInfo.phone,
          dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString().split('T')[0] : prev.patientInfo.dateOfBirth,
        }
      }));
    }
  }, [formData, isProfileComplete, bookingData.patientInfo.firstName]);

  // Get provider ID from environment or use default
  const providerId = import.meta.env.VITE_DEFAULT_PROVIDER_ID || "default-provider-id";

  // Dynamic step titles based on authentication state
  const stepTitles = (isAuthenticated || bookingData.isAuthenticated)
    ? ['Type', 'Date & Time', 'Your Info', 'Payment']
    : ['Sign In', 'Type', 'Date & Time', 'Your Info', 'Payment'];

  const updateBookingData = (field: keyof BookingData, value: unknown) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return bookingData.isAuthenticated && bookingData.userEmail !== '';
      case 1:
        return bookingData.consultationType !== '';
      case 2:
        return bookingData.selectedDate !== null && bookingData.selectedTime !== '';
      case 3: {
        const { firstName, lastName, email, phone, reason } = bookingData.patientInfo;
        return Boolean(firstName && lastName && email && phone && reason);
      }
      case 4:
        return bookingData.paymentMethod !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    console.log('Booking submitted:', bookingData);
    navigate('/booking/confirmation', { 
      state: { 
        bookingData: {
          ...bookingData,
          paymentCompleted: true // Flag to show calendar integration
        }
      }
    });
  };

  // Helper functions for rendering individual steps
  const renderStep1 = () => (
    <ConsultationTypeStep
      bookingData={{
        consultationType: bookingData.consultationType
      }}
      updateBookingData={(data) => updateBookingData('consultationType', data.consultationType)}
    />
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        // Only show authentication step if user is not globally authenticated
        if (!isAuthenticated && !bookingData.isAuthenticated) {
          return (
            <SimpleSignOn
              onAuthenticated={(email: string) => {
                updateBookingData('isAuthenticated', true);
                updateBookingData('userEmail', email);
                // Auto-populate email in patient info
                updateBookingData('patientInfo', {
                  ...bookingData.patientInfo,
                  email
                });
              }}
              isAuthenticated={bookingData.isAuthenticated || isAuthenticated}
              userEmail={bookingData.userEmail || user?.email || ''}
            />
          );
        } else {
          // User is already authenticated, show next step
          return renderStep1();
        }
      case 1:
        return renderStep1();
      case 2:
        return (
          <DateTimeStep
            bookingData={{
              date: bookingData.selectedDate,
              time: bookingData.selectedTime,
              consultationType: bookingData.consultationType
            }}
            updateBookingData={(data) => {
              if (data.date !== undefined) updateBookingData('selectedDate', data.date);
              if (data.time !== undefined) updateBookingData('selectedTime', data.time);
            }}
            providerId={providerId}
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
              reason: bookingData.patientInfo.reason,
              reasonAudio: bookingData.patientInfo.reasonAudio
            }}
            updateBookingData={(data) => {
              const updates: Record<string, unknown> = {};
              if (data.patientName !== undefined) {
                const [firstName, ...lastNameParts] = data.patientName.split(' ');
                updates.firstName = firstName || '';
                updates.lastName = lastNameParts.join(' ') || '';
              }
              if (data.patientEmail !== undefined) updates.email = data.patientEmail;
              if (data.patientPhone !== undefined) updates.phone = data.patientPhone;
              if (data.dateOfBirth !== undefined) updates.dateOfBirth = data.dateOfBirth?.toISOString() || '';
              if (data.reason !== undefined) updates.reason = data.reason;
              if (data.reasonAudio !== undefined) updates.reasonAudio = data.reasonAudio;
              
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

  // Handle new booking completion
  const handleNewBookingComplete = (appointmentData: unknown) => {
    console.log('✅ New booking completed:', appointmentData);
    navigate('/dashboard');
  };

  // If using new booking system, render it instead
  if (useNewBooking) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-medical-primary/5 to-medical-accent/5 dark:from-gray-900 dark:to-gray-800 ${isMobile ? 'px-3 py-4' : 'px-4 py-8'}`}>
        <div className={`${isMobile ? 'max-w-full' : 'container mx-auto max-w-4xl'}`}>
          {/* Booking Mode Toggle */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book Your Appointment</h1>
              <p className="text-gray-600 dark:text-gray-300">Choose your preferred booking experience</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={useNewBooking ? "default" : "secondary"}>New System</Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseNewBooking(!useNewBooking)}
              >
                Switch to {useNewBooking ? 'Classic' : 'New'} Booking
              </Button>
            </div>
          </div>

          {/* New Booking Calendar */}
          <NewBookingCalendar
            providerId={providerId}
            consultationType={bookingData.consultationType === 'video' ? 'VIDEO' : 'AUDIO'}
            onBookingComplete={handleNewBookingComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-medical-primary/5 to-medical-accent/5 dark:from-gray-900 dark:to-gray-800 ${isMobile ? 'px-3 py-4' : 'px-4 py-8'}`}>
      <div className={`${isMobile ? 'max-w-full' : 'container mx-auto max-w-4xl'}`}>
        {/* Booking Mode Toggle */}
        <div className="mb-6 flex items-center justify-between">
          <BookingHeader totalSteps={totalSteps} />
          <div className="flex items-center gap-2">
            <Badge variant={useNewBooking ? "secondary" : "default"}>Classic System</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUseNewBooking(!useNewBooking)}
            >
              Switch to {useNewBooking ? 'Classic' : 'New'} Booking
            </Button>
          </div>
        </div>

        <Card className={`shadow-xl border-0 dark:bg-gray-800/95 dark:border-gray-700 ${isMobile ? 'mx-0' : ''}`}>
          <CardContent className={`${isMobile ? 'p-4' : 'p-6 md:p-8'}`}>
            <BookingProgress
              currentStep={currentStep}
              totalSteps={totalSteps}
              stepTitles={stepTitles}
            />
            
            <div className={`${isMobile ? 'mt-6' : 'mt-8'}`}>
              {renderStep()}
            </div>
            
            <div className={`${isMobile ? 'mt-6' : 'mt-8'}`}>
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
  );
};

export default BookingPage;
