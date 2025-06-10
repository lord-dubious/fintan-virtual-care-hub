import React, { useState } from 'react';
import { ConsultationTypeStep } from './ConsultationTypeStep';
import { DateTimeStep } from './DateTimeStep';
import { PatientInfoStep } from './PatientInfoStep';
import { PaymentStep } from './PaymentStep';
import { AppointmentConfirmation } from './AppointmentConfirmation';
import { BookingProgress } from './BookingProgress';
import { appointmentService } from '@/lib/services/appointmentService';

interface BookingData {
  type: string;
  date: Date | null;
  time: string;
  patientInfo: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    reason: string;
  };
  paymentMethod: string;
}

const BookingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    type: '',
    date: null,
    time: '',
    patientInfo: {
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      reason: '',
    },
    paymentMethod: '',
  });
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

  const handleStepComplete = (stepData: any) => {
    setBookingData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmitBooking = async () => {
    try {
      if (!bookingData.date) return;

      const scheduledAt = new Date(bookingData.date);
      const [hours, minutes] = bookingData.time.split(':');
      scheduledAt.setHours(parseInt(hours), parseInt(minutes));

      const appointmentData = {
        patientEmail: bookingData.patientInfo.email,
        patientName: bookingData.patientInfo.name,
        patientPhone: bookingData.patientInfo.phone,
        scheduledAt,
        type: bookingData.type,
        reason: bookingData.patientInfo.reason,
        paymentMethod: bookingData.paymentMethod,
      };

      const result = await appointmentService.createAppointment(appointmentData);
      
      if (result.success && result.appointment) {
        setAppointmentId(result.appointment.id);
        setCurrentStep(5);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <ConsultationTypeStep onComplete={handleStepComplete} />;
      case 2:
        return <DateTimeStep onComplete={handleStepComplete} />;
      case 3:
        return <PatientInfoStep onComplete={handleStepComplete} />;
      case 4:
        return <PaymentStep onComplete={handleStepComplete} />;
      case 5:
        return <AppointmentConfirmation appointmentId={appointmentId} />;
      default:
        return <div>Error</div>;
    }
  };

  return (
    <div className="container mx-auto py-12">
      <BookingProgress currentStep={currentStep} />
      <div className="mt-8">{renderStep()}</div>
      {currentStep === 4 && (
        <div className="mt-6">
          <button
            onClick={handleSubmitBooking}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Confirm Booking
          </button>
        </div>
      )}
    </div>
  );
};

export default BookingFlow;
