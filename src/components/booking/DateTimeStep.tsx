
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, isPast, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateTimeStepProps {
  bookingData: {
    date: Date | null;
    time: string;
  };
  updateBookingData: (data: { date?: Date | null; time?: string }) => void;
}

// Simulated available time slots
const generateTimeSlots = (date: Date) => {
  // Generate different slots based on date for demonstration
  const day = date.getDay();
  const baseSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"];
  
  // Remove some slots for weekend days to simulate limited availability
  if (day === 6) { // Saturday
    return baseSlots.slice(0, 3); // Morning only
  } else if (day === 0) { // Sunday
    return []; // No slots on Sunday
  } else if (day === 5) { // Friday
    return baseSlots.slice(1, 5); // Limited slots
  }
  
  return baseSlots;
};

const DateTimeStep: React.FC<DateTimeStepProps> = ({ bookingData, updateBookingData }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    bookingData.date ? new Date(bookingData.date) : undefined
  );
  
  const timeSlots = selectedDate ? generateTimeSlots(selectedDate) : [];

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    updateBookingData({ date: date || null, time: '' });
  };

  const handleTimeSelect = (time: string) => {
    updateBookingData({ time });
  };

  // Disable past dates and Sundays (for demo)
  const disabledDays = (date: Date) => {
    return isPast(date) || date.getDay() === 0;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 dark:text-medical-dark-text-primary">Select Date & Time</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-medium mb-4 dark:text-medical-dark-text-primary self-start">Select a Date</h3>
          <div className="flex justify-center w-full">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={disabledDays}
              fromDate={new Date()}
              toDate={addDays(new Date(), 30)}
              className="rounded-md border dark:border-gray-700"
            />
          </div>
          <p className="mt-2 text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary self-start">
            Consultations available Monday-Saturday
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4 dark:text-medical-dark-text-primary">Select a Time</h3>
          {selectedDate ? (
            timeSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={bookingData.time === time ? "default" : "outline"}
                    className={cn(
                      bookingData.time === time 
                        ? "bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90" 
                        : "dark:bg-transparent dark:text-medical-dark-text-primary dark:hover:bg-medical-primary/20"
                    )}
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                No available time slots for {format(selectedDate, 'PPP')}. Please select a different date.
              </p>
            )
          ) : (
            <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
              Please select a date to see available time slots.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateTimeStep;
