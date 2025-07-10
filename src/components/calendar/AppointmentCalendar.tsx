import React from "react";
import { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calendarService } from '@/lib/services/calendarService';

interface DayAvailability {
  date: Date;
  isAvailable: boolean;
  startTime?: string;
  endTime?: string;
}

interface AppointmentCalendarProps {
  providerId: string;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  providerId,
  onDateSelect,
  selectedDate,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  // Load provider availability for the current week
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
        const availability = await calendarService.getProviderWeeklyAvailability(providerId, startDate);
        setWeekDates(availability);
      } catch (error) {
        console.error('Error fetching availability:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [providerId, currentDate]);

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const previousWeekStart = addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), -7);
    setCurrentDate(previousWeekStart);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const nextWeekStart = addDays(startOfWeek(currentDate, { weekStartsOn: 0 }), 7);
    setCurrentDate(nextWeekStart);
  };

  // Handle date selection
  const handleDateSelect = (date: Date, isAvailable: boolean) => {
    if (isAvailable) {
      onDateSelect(date);
    }
  };

  // Get day name
  const getDayName = (date: Date) => {
    return format(date, 'EEE');
  };

  // Get day number
  const getDayNumber = (date: Date) => {
    return format(date, 'd');
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Select a Date</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((day, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-2 rounded-md cursor-pointer transition-colors ${
                day.isAvailable
                  ? selectedDate && isSameDay(day.date, selectedDate)
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-gray-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } ${isToday(day.date) ? 'border border-primary' : ''}`}
              onClick={() => handleDateSelect(day.date, day.isAvailable)}
            >
              <span className="text-xs font-medium">{getDayName(day.date)}</span>
              <span className="text-lg font-bold">{getDayNumber(day.date)}</span>
              {day.isAvailable ? (
                <span className="text-xs mt-1">
                  {day.startTime} - {day.endTime}
                </span>
              ) : (
                <span className="text-xs mt-1">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

