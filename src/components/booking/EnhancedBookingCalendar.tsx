import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, isToday, isTomorrow, isPast } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Calendar as CalendarPlus, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import SmartSuggestionsView from './SmartSuggestionsView';
import WeekView from './WeekView';
import CalendarView from './CalendarView';
import AppointmentConfirmation from './AppointmentConfirmation';
import ViewModeSelector from './ViewModeSelector';
import TimeFilter from './TimeFilter';
import { useAvailability, useGenerateCalendarExport } from '@/hooks/useCalendar';
import { logger } from '@/lib/utils/monitoring'; // Import logger

interface EnhancedBookingCalendarProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  consultationType: string;
  providerId?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  priority: 'high' | 'medium' | 'low';
  reason?: string;
}

interface SmartSuggestion {
  date: Date;
  time: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  discount?: number;
}

const EnhancedBookingCalendar: React.FC<EnhancedBookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  consultationType,
  providerId: propProviderId
}) => {
  const { toast } = useToast();
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  const generateCalendarExport = useGenerateCalendarExport();

  // Use provided provider ID or fall back to environment variable
  const providerId = propProviderId || import.meta.env.VITE_DEFAULT_PROVIDER_ID || "default-provider-id";

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

  const [availableSlots, setAvailableSlots] = useState<Record<string, TimeSlot[]>>({});
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);

  useEffect(() => {
    if (isLoading || error || !availabilityData) {
      setAvailableSlots({});
      setSmartSuggestions([]);
      return;
    }

    const slots: Record<string, TimeSlot[]> = {};
    const suggestions: SmartSuggestion[] = [];
    
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

    // Generate smart suggestions from fetched data
    const today = new Date();
    const nextAvailableSlots = Object.entries(slots)
      .filter(([_, times]) => times.some(t => t.available))
      .slice(0, 6); // Limit to 6 suggestions

    nextAvailableSlots.forEach(([dateStr, times]) => {
      const date = new Date(dateStr);
      const availableTimes = times.filter(t => t.available);
      if (availableTimes.length === 0) return;
      
      let reason = '';
      let priority: 'high' | 'medium' | 'low' = 'medium';
      let discount = undefined;
      
      if (isToday(date)) {
        reason = 'Available today - Same day consultation';
        priority = 'high';
        discount = 20;
      } else if (isTomorrow(date)) {
        reason = 'Available tomorrow - Next day appointment';
        priority = 'high';
        discount = 15;
      } else if (date.getDay() === 1) { // Monday
        reason = 'Monday morning - Fresh start to your week';
        priority = 'medium';
      } else if (date.getDay() === 6) { // Saturday
        reason = 'Weekend slot - Flexible timing';
        priority = 'low';
      } else if (availableTimes.some(t => t.priority === 'high')) {
        reason = 'Premium time slot - High availability';
        priority = 'high';
      } else {
        reason = `${format(date, 'EEEE')} appointment - Good availability`;
        priority = 'medium';
      }
      
      suggestions.push({
        date,
        time: availableTimes[0].time, // Take the first available time
        reason,
        priority,
        discount
      });
    });

    setSmartSuggestions(suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }));

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

  const handleAddToCalendar = async (type: 'google' | 'apple' | 'outlook') => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select a date and time first",
        variant: "destructive"
      });
      return;
    }

    // For now, we'll use a mock appointment ID. In a real app, this would be the actual appointment ID
    const mockAppointmentId = "temp-appointment-id";

    try {
      switch (type) {
        case 'google': {
          // Generate Google Calendar URL
          const startDateTime = new Date(selectedDate);
          const [time, period] = selectedTime.split(' ');
          const [hours, minutes] = time.split(':');
          let hour24 = parseInt(hours);
          if (period === 'PM' && hour24 !== 12) hour24 += 12;
          if (period === 'AM' && hour24 === 12) hour24 = 0;

          startDateTime.setHours(hour24, parseInt(minutes), 0, 0);
          const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour later

          const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Dr.%20Fintan%20Consultation&dates=${startDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDateTime.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=Virtual%20consultation%20with%20Dr.%20Fintan`;

          window.open(googleUrl, '_blank');
          toast({
            title: "Opening Google Calendar",
            description: "Adding appointment to your Google Calendar..."
          });
          break;
        }

        case 'apple':
        case 'outlook': {
          // Generate and download ICS file
          await generateCalendarExport.mutateAsync(mockAppointmentId);
          break;
        }
      }
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to add to calendar:', errorData);
      toast({
        title: "Failed to add to calendar",
        description: "Please try again or add the appointment manually.",
        variant: "destructive"
      });
    }

    setShowCalendarOptions(false);
  };

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
                
                <Popover open={showCalendarOptions} onOpenChange={setShowCalendarOptions}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Add to Calendar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start mb-1"
                      onClick={() => handleAddToCalendar('google')}
                    >
                      Add to Google Calendar
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start mb-1"
                      onClick={() => handleAddToCalendar('apple')}
                    >
                      Add to Apple Calendar
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleAddToCalendar('outlook')}
                    >
                      Add to Outlook
                    </Button>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedBookingCalendar;
