
import React, { useState } from 'react';
import EnhancedBookingCalendar from './EnhancedBookingCalendar';

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
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Schedule Your Consultation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Choose the perfect time that works for you with our intelligent scheduling system
        </p>
      </div>
      
      <EnhancedBookingCalendar 
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
