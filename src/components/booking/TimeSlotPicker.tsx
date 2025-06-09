import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { calendarService, TimeSlot } from '@/lib/services/calendarService';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TimeSlotPickerProps {
  providerId: string;
  selectedDate: Date;
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
  selectedTimeSlot?: TimeSlot;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  providerId,
  selectedDate,
  onTimeSlotSelect,
  selectedTimeSlot,
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available time slots when the selected date changes
  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDate) return;

      setLoading(true);
      setError(null);
      try {
        const result = await calendarService.getAvailableTimeSlots(providerId, selectedDate);
        if (result.success && result.timeSlots) {
          setTimeSlots(result.timeSlots);
        } else {
          setError(result.message || 'Failed to load time slots');
          setTimeSlots([]);
        }
      } catch (err) {
        console.error('Error fetching time slots:', err);
        setError('An error occurred while loading time slots');
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeSlots();
  }, [providerId, selectedDate]);

  // Format time for display
  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  // Check if a time slot is selected
  const isSelected = (timeSlot: TimeSlot) => {
    if (!selectedTimeSlot) return false;
    return (
      timeSlot.startTime.getTime() === selectedTimeSlot.startTime.getTime() &&
      timeSlot.endTime.getTime() === selectedTimeSlot.endTime.getTime()
    );
  };

  // Group time slots by morning, afternoon, and evening
  const groupedTimeSlots = {
    morning: timeSlots.filter(slot => slot.startTime.getHours() < 12),
    afternoon: timeSlots.filter(slot => slot.startTime.getHours() >= 12 && slot.startTime.getHours() < 17),
    evening: timeSlots.filter(slot => slot.startTime.getHours() >= 17),
  };

  // Check if there are any available slots
  const hasAvailableSlots = timeSlots.some(slot => slot.isAvailable);

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium mb-4">Select a Time</h3>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">{error}</div>
      ) : !hasAvailableSlots ? (
        <div className="text-center py-4 text-gray-500">No available time slots for this date</div>
      ) : (
        <ScrollArea className="h-64 pr-4">
          {Object.entries(groupedTimeSlots).map(([period, slots]) => {
            // Skip periods with no slots
            if (slots.length === 0) return null;

            // Skip periods with no available slots
            const availableSlots = slots.filter(slot => slot.isAvailable);
            if (availableSlots.length === 0) return null;

            return (
              <div key={period} className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2 capitalize">{period}</h4>
                <div className="grid grid-cols-3 gap-2">
                  {slots.map((slot, index) => (
                    <Button
                      key={index}
                      variant={isSelected(slot) ? 'default' : 'outline'}
                      size="sm"
                      disabled={!slot.isAvailable}
                      onClick={() => onTimeSlotSelect(slot)}
                      className={`${
                        !slot.isAvailable ? 'bg-gray-100 text-gray-400' : ''
                      }`}
                    >
                      {formatTime(slot.startTime)}
                    </Button>
                  ))}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      )}
    </div>
  );
};

