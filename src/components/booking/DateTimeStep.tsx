
import React, { useState } from 'react';
import IntelligentCalendar from './IntelligentCalendar';

interface DateTimeStepProps {
  bookingData: {
    date: Date | null;
    time: string;
    consultationType?: string;
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 dark:text-medical-dark-text-primary">
          When would you like to meet?
        </h2>
        <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
          Our AI will suggest the best available times for you, or you can browse manually
        </p>
      </div>
      
      <IntelligentCalendar 
        selectedDate={selectedDate} 
        selectedTime={bookingData.time}
        onDateSelect={handleDateSelect}
        onTimeSelect={handleTimeSelect}
        consultationType={bookingData.consultationType || 'consultation'}
      />
    </div>
  );
};

export default DateTimeStep;
