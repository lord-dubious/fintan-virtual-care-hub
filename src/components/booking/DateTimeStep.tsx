
import React, { useState } from 'react';
import BookingCalendar from './BookingCalendar';

interface DateTimeStepProps {
  bookingData: {
    date: Date | null;
    time: string;
  };
  updateBookingData: (data: { date?: Date | null; time?: string }) => void;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({ bookingData, updateBookingData }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    bookingData.date ? new Date(bookingData.date) : undefined
  );

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    updateBookingData({ date: date || null, time: '' });
  };

  const handleTimeSelect = (time: string) => {
    updateBookingData({ time });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 dark:text-medical-dark-text-primary">Select Date & Time</h2>
      
      <BookingCalendar 
        selectedDate={selectedDate} 
        selectedTime={bookingData.time}
        onDateSelect={handleDateSelect}
        onTimeSelect={handleTimeSelect}
      />
      
      <p className="mt-6 text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
        Consultations available Monday-Saturday. Sunday closed.
      </p>
    </div>
  );
};

export default DateTimeStep;
