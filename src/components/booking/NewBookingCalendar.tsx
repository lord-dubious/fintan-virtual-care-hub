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

interface NewBookingCalendarProps {
  providerId: string;
  onSlotSelected?: (date: string, time: string) => void;
  onBookingComplete?: (appointmentData: any) => void;
  consultationType?: 'VIDEO' | 'AUDIO';
}

const NewBookingCalendar: React.FC<NewBookingCalendarProps> = ({
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
    startOfMonth(currentMonth),
    endOfMonth(addDays(currentMonth, 60)), // Get 2 months of data
    30 // 30-minute slots
  );

  // Conflict checking
  const conflictCheck = useConflictCheck();

  // Fetch provider data
  useEffect(() => {
    if (providerId) {
      fetchProviderData();
    }
  }, [providerId]);

  const fetchProviderData = async () => {
    try {
      const response = await fetch(`/api/providers/${providerId}`);
      const data = await response.json();

      if (data.success) {
        setProvider(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load provider information",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching provider:', error);
      toast({
        title: "Error",
        description: "Failed to load provider information",
        variant: "destructive"
      });
    }
  };

  // Group availability by date for easier access
  const availabilityByDate = React.useMemo(() => {
    const grouped: Record<string, typeof availabilitySlots> = {};

    availabilitySlots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });

    return grouped;
  }, [availabilitySlots]);

  // Check if a date is available
  const isDateAvailable = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const daySlots = availabilityByDate[dateString] || [];
    return daySlots.some(slot => slot.isAvailable);
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  // Get available time slots for selected date
  const getTimeSlotsForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const daySlots = availabilityByDate[dateString] || [];
    return daySlots
      .filter(slot => slot.isAvailable)
      .map(slot => slot.startTime)
      .sort();
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);

    console.log('📅 Date selected:', format(date, 'yyyy-MM-dd'));
  };

  const handleTimeSelect = async (time: string) => {
    if (!selectedDate) return;

    console.log('⏰ Time selected:', time);
    setSelectedTime(time);

    // Validate the slot with conflict checking
    try {
      const appointmentDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${time}:00`);

      const result = await conflictCheck.mutateAsync({
        providerId,
        appointmentDate: appointmentDateTime,
        duration: 30,
        patientId: user?.patient?.id,
      });

      if (!result.isValid) {
        toast({
          title: "Slot Unavailable",
          description: result.conflicts[0]?.message || "This time slot is no longer available",
          variant: "destructive"
        });

        // Refresh availability data
        refetchAvailability();
        setSelectedTime(null);
        return;
      }

      // Show warnings if any
      if (result.warnings.length > 0) {
        toast({
          title: "Booking Warning",
          description: result.warnings[0].message,
          variant: "default"
        });
      }

      if (onSlotSelected) {
        onSlotSelected(format(selectedDate, 'yyyy-MM-dd'), time);
      }
    } catch (error) {
      console.error('Error validating time slot:', error);
      toast({
        title: "Validation Error",
        description: "Unable to validate time slot. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !provider) {
      toast({
        title: "Error",
        description: "Please select a date and time",
        variant: "destructive"
      });
      return;
    }

    // Check authentication
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);
    try {
      // Final validation before booking
      console.log('🔍 Final validation before booking...');
      const appointmentDateTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`);

      const validation = await conflictCheck.mutateAsync({
        providerId,
        appointmentDate: appointmentDateTime,
        duration: 30,
        patientId: user?.patient?.id,
      });

      if (!validation.isValid) {
        toast({
          title: "Booking Failed",
          description: validation.conflicts[0]?.message || "Time slot is no longer available",
          variant: "destructive"
        });

        // Refresh availability and reset selection
        refetchAvailability();
        setSelectedTime(null);
        return;
      }

      const appointmentData = {
        providerId,
        appointmentDate: appointmentDateTime.toISOString(),
        duration: 30,
        consultationType,
        reason: 'General consultation',
        status: 'SCHEDULED'
      };

      console.log('📝 Creating appointment:', appointmentData);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success!",
          description: "Appointment booked successfully",
        });

        // Refresh availability data
        refetchAvailability();

        if (onBookingComplete) {
          onBookingComplete(data.data);
        }

        // Reset selections
        setSelectedDate(null);
        setSelectedTime(null);
      } else {
        toast({
          title: "Booking Failed",
          description: data.error || "Failed to book appointment",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading availability...</span>
        </CardContent>
      </Card>
    );
  }

  // Show error if availability fetch fails
  if (availabilityError) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-600 mb-4">Failed to load availability</p>
          <Button onClick={() => refetchAvailability()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Provider Information */}
      {provider && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {provider.user.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{provider.specialization}</Badge>
              <span className="text-sm text-gray-600">
                Consultation Fee: ${provider.consultationFee}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getCalendarDays().map(date => {
              const dateString = format(date, 'yyyy-MM-dd');
              const isSelected = selectedDate && isSameDay(selectedDate, date);
              const isAvailable = isDateAvailable(date);
              const isPast = isBefore(date, new Date()) && !isToday(date);

              return (
                <Button
                  key={dateString}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  className={`
                    h-10 w-10 p-0 text-sm
                    ${isToday(date) ? 'ring-2 ring-blue-500' : ''}
                    ${isAvailable && !isPast ? 'hover:bg-green-100' : ''}
                    ${!isAvailable || isPast ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  disabled={!isAvailable || isPast}
                  onClick={() => handleDateSelect(date)}
                >
                  {format(date, 'd')}
                </Button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-100 rounded border"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded border"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded border"></div>
              <span>Today</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Slots */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Times for {format(selectedDate, 'MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                  {getTimeSlotsForDate(selectedDate).map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTimeSelect(time)}
                      className="text-sm"
                      disabled={conflictCheck.isPending}
                    >
                      {conflictCheck.isPending && selectedTime === time ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        time
                      )}
                    </Button>
                  ))}
                </div>

                {getTimeSlotsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No available time slots for this date
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Booking Confirmation */}
      {selectedDate && selectedTime && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Date:</strong> {format(selectedDate, 'MMMM d, yyyy')}</p>
              <p><strong>Time:</strong> {selectedTime}</p>
              <p><strong>Duration:</strong> 30 minutes</p>
              <p><strong>Type:</strong> {consultationType} Consultation</p>
              {provider && <p><strong>Provider:</strong> {provider.user.name}</p>}
            </div>
            
            <Button 
              onClick={handleBookAppointment}
              disabled={isBooking}
              className="w-full"
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Booking...
                </>
              ) : (
                'Book Appointment'
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NewBookingCalendar;
