import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, isPast } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { useAvailability } from '@/hooks/useCalendar';
import { useProviders } from '@/hooks/useProviders';
import { logger } from '@/lib/utils/monitoring'; // Import logger

interface EnhancedBookingCalendarProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  consultationType: string;
  providerId?: string;
  className?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  priority: 'high' | 'medium' | 'low';
  reason?: string;
}



const EnhancedBookingCalendar: React.FC<EnhancedBookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  consultationType,
  providerId: propProviderId,
  className
}) => {


  // Fetch providers to get a default provider if none specified
  const { data: providersData } = useProviders();

  // Use provided provider ID or fall back to first available provider
  const providerId = propProviderId ||
                    providersData?.providers?.[0]?.id ||
                    import.meta.env.VITE_DEFAULT_PROVIDER_ID ||
                    "default-provider-id";

  // Calculate date range for availability query
  const dateRange = useMemo(() => {
    const today = new Date();
    return {
      dateFrom: today,
      dateTo: addDays(today, 30)
    };
  }, []);

  // Fetch availability data
  const { data: availabilityData, isLoading, error, refetch } = useAvailability({
    providerId,
    dateFrom: dateRange.dateFrom,
    dateTo: dateRange.dateTo,
    consultationType: consultationType as 'VIDEO' | 'AUDIO' // Ensure type compatibility
  });

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 Booking Calendar Debug:', {
      providerId,
      dateRange,
      consultationType,
      isLoading,
      error: error?.message,
      availabilityData,
      providersData
    });
  }, [providerId, dateRange, consultationType, isLoading, error, availabilityData, providersData]);

  const [availableSlots, setAvailableSlots] = useState<Record<string, TimeSlot[]>>({});

  useEffect(() => {
    if (isLoading || error || !availabilityData) {
      setAvailableSlots({});
      return;
    }

    const slots: Record<string, TimeSlot[]> = {};
    
    availabilityData.forEach(dayAvailability => {
      const dateKey = format(new Date(dayAvailability.date), 'yyyy-MM-dd');
      const timeSlots: TimeSlot[] = dayAvailability.timeSlots.map(slot => ({
        time: slot.startTime,
        available: slot.isAvailable,
        priority: 'medium', // Default priority, can be refined based on backend data
        reason: slot.blockReason,
      }));
      slots[dateKey] = timeSlots;
    });
    setAvailableSlots(slots);

  }, [availabilityData, isLoading, error, consultationType]); // Added consultationType to dependencies

  // Show error message if availability fetch fails
  if (error) {
    logger.error('Failed to load availability:', { error: error.message }); // Log the error
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">
          Failed to load availability. Please try again.
        </p>
        <Button onClick={() => refetch()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const getAvailableTimesForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    const dateString = format(date, 'yyyy-MM-dd');
    const dateData = availableSlots[dateString]; // Use availableSlots directly
    
    return dateData?.filter(slot => slot.available).map(slot => slot.time) || [];
  };
  
  const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];



  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col w-full md:w-auto">
          <h3 className="text-lg font-medium mb-4 dark:text-medical-dark-text-primary">Select a Date</h3>
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              disabled={(date) => isPast(date) || date.getDay() === 0}
              fromDate={new Date()}
              toDate={addDays(new Date(), 30)}
              className="rounded-md border dark:border-gray-700"
              modifiersClassNames={{
                selected: "bg-medical-primary text-white hover:bg-medical-primary hover:text-white dark:bg-medical-accent dark:text-medical-dark-surface",
                today: "bg-medical-bg-light text-medical-primary font-bold dark:bg-medical-dark-surface dark:text-medical-accent"
              }}
              modifiers={{
                available: (date) => {
                  const dateString = format(date, 'yyyy-MM-dd');
                  const dateData = availableSlots[dateString];
                  return dateData?.some(slot => slot.available) ? true : false;
                }
              }}
              modifiersStyles={{
                available: {
                  color: 'var(--medical-primary)',
                  backgroundColor: 'rgba(var(--medical-primary-rgb), 0.1)',
                  fontWeight: 500
                }
              }}
            />
          </Card>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-4 dark:text-medical-dark-text-primary">Available Times</h3>
          
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center h-40">
                <div className="animate-pulse flex flex-col items-center">
                  <Clock className="h-8 w-8 text-medical-primary dark:text-medical-accent mb-2" />
                  <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary">
                    Loading available times...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <p className="text-red-600 dark:text-red-400 mb-4">
                    Unable to load available times: {error.message}
                  </p>
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : selectedDate ? (
            <Card>
              <CardContent className="p-6">
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className={cn(
                          "py-6 transition-all",
                          selectedTime === time 
                            ? "bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90" 
                            : "dark:bg-transparent dark:text-medical-dark-text-primary dark:hover:bg-medical-primary/20"
                        )}
                        onClick={() => onTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                      No available time slots for {format(selectedDate, 'PPP')}.
                    </p>
                    <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary mt-2">
                      Please select a different date.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <CalendarIcon className="h-8 w-8 text-medical-neutral-400 dark:text-medical-dark-text-secondary mb-2" />
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Please select a date to see available times
                </p>
              </CardContent>
            </Card>
          )}
          
          {selectedDate && selectedTime && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h4 className="font-medium text-medical-primary dark:text-medical-accent mb-2">Selected Appointment</h4>
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-primary mb-4">
                  {format(selectedDate, 'PPP')} at {selectedTime}
                </p>
                

              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookingCalendar;
