import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Clock, Calendar as CalendarIcon, User, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore } from 'date-fns';
import { useProviderAvailability, useConflictCheck } from '@/hooks/useProviderAvailability';
import { useAuth } from '@/hooks/useAuth';

interface Provider {
  id: string;
  userId: string;
  specialization: string;
  consultationFee: number;
  user: {
    name: string;
    email: string;
  };
}

interface BookingCalendarProps {
  providerId: string;
  onSlotSelected?: (date: string, time: string) => void;
  onBookingComplete?: (appointmentData: any) => void;
  consultationType?: 'VIDEO' | 'AUDIO';
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  providerId,
  onSlotSelected,
  onBookingComplete,
  consultationType = 'VIDEO'
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  // Get availability data using the new hook
  const {
    data: availabilitySlots = [],
    isLoading,
    error: availabilityError,
    refetch: refetchAvailability
  } = useProviderAvailability(
    providerId,
    format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
    format(endOfMonth(currentMonth), 'yyyy-MM-dd')
  );

  // Conflict checking hook
  const {
    mutate: checkConflicts,
    data: conflictData,
    isPending: isCheckingConflicts
  } = useConflictCheck();

  // Fetch provider details
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const response = await fetch(`/api/providers/${providerId}`);
        if (response.ok) {
          const data = await response.json();
          setProvider(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch provider:', error);
      }
    };

    if (providerId) {
      fetchProvider();
    }
  }, [providerId]);

  // Generate calendar days for current month
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Get available times for selected date
  const getAvailableTimesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySlots = availabilitySlots.find(slot => slot.date === dateStr);
    return daySlots?.timeSlots?.filter(slot => slot.available) || [];
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    
    // Check for conflicts when date is selected
    if (isAuthenticated && user) {
      checkConflicts({
        providerId,
        date: format(date, 'yyyy-MM-dd'),
        patientId: user.patient?.id || user.id
      });
    }
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    
    if (selectedDate && onSlotSelected) {
      onSlotSelected(format(selectedDate, 'yyyy-MM-dd'), time);
    }
  };

  // Handle booking confirmation
  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !isAuthenticated || !user) {
      toast({
        title: "Error",
        description: "Please select a date and time, and ensure you're logged in.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      const appointmentData = {
        providerId,
        patientId: user.patient?.id || user.id,
        appointmentDate: selectedDate.toISOString(),
        appointmentTime: selectedTime,
        consultationType,
        status: 'SCHEDULED'
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const result = await response.json();
        
        toast({
          title: "Booking Confirmed!",
          description: `Your ${consultationType.toLowerCase()} consultation is scheduled for ${format(selectedDate, 'PPP')} at ${selectedTime}.`,
        });

        if (onBookingComplete) {
          onBookingComplete(result.data);
        }

        // Reset form
        setSelectedDate(null);
        setSelectedTime(null);
        refetchAvailability();
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "There was an error creating your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = direction === 'prev' 
        ? addDays(startOfMonth(prev), -1)
        : addDays(endOfMonth(prev), 1);
      return newMonth;
    });
    setSelectedDate(null);
    setSelectedTime(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading availability...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (availabilityError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Failed to load availability</p>
            <Button onClick={() => refetchAvailability()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Provider Info */}
      {provider && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">{provider.user.name}</h3>
                <p className="text-sm text-gray-600">{provider.specialization}</p>
                <p className="text-sm font-medium">${provider.consultationFee}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[120px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(date => {
              const availableTimes = getAvailableTimesForDate(date);
              const hasAvailability = availableTimes.length > 0;
              const isPastDate = isBefore(date, new Date()) && !isToday(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <Button
                  key={date.toISOString()}
                  variant={isSelected ? "default" : "ghost"}
                  className={`
                    h-12 p-1 text-sm relative
                    ${isPastDate ? 'opacity-50 cursor-not-allowed' : ''}
                    ${hasAvailability && !isPastDate ? 'border-green-200 hover:border-green-300' : ''}
                    ${isToday(date) ? 'ring-2 ring-blue-200' : ''}
                  `}
                  disabled={isPastDate || !hasAvailability}
                  onClick={() => handleDateSelect(date)}
                >
                  <div className="flex flex-col items-center">
                    <span>{format(date, 'd')}</span>
                    {hasAvailability && !isPastDate && (
                      <div className="w-1 h-1 bg-green-500 rounded-full mt-1" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Times - {format(selectedDate, 'PPP')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const availableTimes = getAvailableTimesForDate(selectedDate);
              
              if (availableTimes.length === 0) {
                return (
                  <p className="text-center text-gray-500 py-8">
                    No available times for this date
                  </p>
                );
              }

              return (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {availableTimes.map(timeSlot => (
                    <Button
                      key={timeSlot.time}
                      variant={selectedTime === timeSlot.time ? "default" : "outline"}
                      className="h-12"
                      onClick={() => handleTimeSelect(timeSlot.time)}
                    >
                      {timeSlot.time}
                    </Button>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Conflict Warning */}
      {conflictData?.hasConflict && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <p className="font-medium">Scheduling Conflict Detected</p>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              {conflictData.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking Confirmation */}
      {selectedDate && selectedTime && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Appointment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{format(selectedDate, 'PPP')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Type:</span>
                    <Badge variant="outline">
                      {consultationType === 'VIDEO' ? 'Video Call' : 'Audio Call'}
                    </Badge>
                  </div>
                  {provider && (
                    <div className="flex justify-between">
                      <span>Fee:</span>
                      <span className="font-medium">${provider.consultationFee}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Button
                onClick={handleBooking}
                disabled={isBooking || isCheckingConflicts}
                className="w-full"
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingCalendar;
