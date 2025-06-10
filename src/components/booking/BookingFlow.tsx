
import React, { useState } from 'react';
import BookingProgress from './BookingProgress';

const BookingFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
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

  const stepTitles = ['Type', 'Date & Time', 'Info', 'Payment', 'Confirmation'];

  return (
    <div className="container mx-auto py-12">
      <BookingProgress 
        currentStep={currentStep} 
        totalSteps={5}
        stepTitles={stepTitles}
      />
      <div className="mt-8">
        <h2>Booking Flow Component</h2>
        <p>Step {currentStep} of {stepTitles.length}</p>
      </div>
    </div>
  );
};

export default BookingFlow;
