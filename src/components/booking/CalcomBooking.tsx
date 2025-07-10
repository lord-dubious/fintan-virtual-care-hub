import React from "react";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Video, Mic, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/authProvider';

interface CalcomBookingProps {
  onBookingComplete?: () => void;
  eventTypeId?: number;
  defaultConsultationType?: 'VIDEO' | 'AUDIO';
}

interface EventType {
  id: number;
  title: string;
  description: string;
  length: number;
  slug: string;
}

interface AvailableSlot {
  time: string;
  available: boolean;
}

const CalcomBooking: React.FC<CalcomBookingProps> = ({
  onBookingComplete,
  eventTypeId,
  defaultConsultationType = 'VIDEO'
}) => {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [consultationType, setConsultationType] = useState<'VIDEO' | 'AUDIO'>(defaultConsultationType);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showCalcomEmbed, setShowCalcomEmbed] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load event types on component mount
  useEffect(() => {
    loadEventTypes();
  }, []);

  // Set default event type if provided
  useEffect(() => {
    if (eventTypeId && eventTypes.length > 0) {
      const eventType = eventTypes.find(et => et.id === eventTypeId);
      if (eventType) {
        setSelectedEventType(eventType);
      }
    }
  }, [eventTypeId, eventTypes]);

  const loadEventTypes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/calcom/event-types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load event types');
      }

      const data = await response.json();
      setEventTypes(data.data || []);

      // Auto-select first event type if only one available
      if (data.data?.length === 1) {
        setSelectedEventType(data.data[0]);
      }
    } catch (error) {
      console.error('Error loading event types:', error);
      toast({
        title: "Error",
        description: "Failed to load available appointment types.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAvailableSlots = async (eventTypeId: number, date: string) => {
    try {
      setIsLoading(true);
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);

      const response = await fetch(
        `/api/calcom/available-slots?eventTypeId=${eventTypeId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load available slots');
      }

      const data = await response.json();
      setAvailableSlots(data.data || []);
    } catch (error) {
      console.error('Error loading available slots:', error);
      toast({
        title: "Error",
        description: "Failed to load available time slots.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (selectedEventType) {
      loadAvailableSlots(selectedEventType.id, date);
    }
  };

  const handleBooking = async () => {
    if (!selectedEventType || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select an appointment type, date, and time.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsBooking(true);

      const startTime = new Date(`${selectedDate}T${selectedTime}`);
      const endTime = new Date(startTime.getTime() + selectedEventType.length * 60000);

      const response = await fetch('/api/calcom/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          eventTypeId: selectedEventType.id,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          consultationType,
          notes: `${consultationType} consultation with Dr. Fintan Ekochin`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create booking');
      }

      const data = await response.json();

      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully booked.",
      });

      if (onBookingComplete) {
        onBookingComplete();
      } else {
        navigate('/patient/appointments');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to create your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const openCalcomEmbed = () => {
    if (!selectedEventType) return;

    // Open Cal.com embed in a modal or new window
    const calcomBaseUrl = process.env.REACT_APP_CALCOM_URL || 'http://localhost:3002';
    const calcomUrl = `${calcomBaseUrl}/${selectedEventType.slug}`;
    window.open(calcomUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
  };

  if (isLoading && eventTypes.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book Your Consultation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Type Selection */}
        {eventTypes.length > 1 && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Appointment Type</Label>
            <div className="grid gap-3">
              {eventTypes.map((eventType) => (
                <div
                  key={eventType.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedEventType?.id === eventType.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEventType(eventType)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{eventType.title}</h3>
                      <p className="text-sm text-gray-600">{eventType.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{eventType.length} min</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consultation Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Consultation Type</Label>
          <RadioGroup
            value={consultationType}
            onValueChange={(value) => setConsultationType(value as 'VIDEO' | 'AUDIO')}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="VIDEO" id="video" />
              <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                <Video className="h-4 w-4" />
                Video Call
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="AUDIO" id="audio" />
              <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer">
                <Mic className="h-4 w-4" />
                Audio Call
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Date Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Select Date</Label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Time Slots */}
        {selectedDate && availableSlots.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-medium">Available Times</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className="h-12"
                >
                  {slot.time}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Cal.com Embed Option */}
        {selectedEventType && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Alternative Booking Method</h3>
                <p className="text-sm text-gray-600">
                  Use Cal.com's native booking interface for more options
                </p>
              </div>
              <Button
                variant="outline"
                onClick={openCalcomEmbed}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Cal.com
              </Button>
            </div>
          </div>
        )}

        {/* Book Button */}
        <div className="flex justify-end pt-6 border-t">
          <Button
            onClick={handleBooking}
            disabled={!selectedEventType || !selectedDate || !selectedTime || isBooking}
            className="px-8 py-3"
          >
            {isBooking ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Booking...
              </>
            ) : (
              'Book Appointment'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalcomBooking;
