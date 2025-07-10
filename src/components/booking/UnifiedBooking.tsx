import React from "react";
import { useState } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAvailabilitySlots, useDoctorInfo, useCreateBooking } from '@/hooks/useBooking';
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Video, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UnifiedBookingProps {
  onBookingComplete?: () => void;
}

const UnifiedBooking: React.FC<UnifiedBookingProps> = ({ onBookingComplete }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ 
    date: string; 
    time: string; 
    providerId?: string;
    providerName?: string;
  } | null>(null);
  const [consultationType, setConsultationType] = useState<'VIDEO' | 'AUDIO'>('VIDEO');

  const { toast } = useToast();
  const navigate = useNavigate();

  // Get doctor info and availability data
  const { data: doctorInfo } = useDoctorInfo();
  const createBooking = useCreateBooking();
  
  const {
    data: availabilitySlots = [],
    isLoading,
    error
  } = useAvailabilitySlots(
    startOfMonth(currentMonth),
    endOfMonth(currentMonth)
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const handleSlotClick = (date: string, time: string) => {
    // Find the selected slot to get provider info
    const slot = availabilitySlots?.find(s => s.date === date && s.startTime === time);
    setSelectedSlot({ 
      date, 
      time, 
      providerId: slot?.providerId,
      providerName: slot?.providerName 
    });
  };

  const handleBookNow = async () => {
    if (!selectedSlot) return;

    try {
      await createBooking.mutateAsync({
        date: selectedSlot.date,
        startTime: selectedSlot.time,
        endTime: selectedSlot.time, // Will be calculated by backend
        consultationType,
        notes: `${consultationType} consultation with Dr. Fintan Ekochin`,
        providerId: selectedSlot.providerId
      });
      
      setSelectedSlot(null);
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
      // Error handled by mutation
    }
  };

  // Group slots by date
  const slotsByDate = availabilitySlots?.reduce((acc, slot) => {
    if (slot.isAvailable) {
      if (!acc[slot.date]) {
        acc[slot.date] = [];
      }
      acc[slot.date].push(slot);
    }
    return acc;
  }, {} as Record<string, typeof availabilitySlots>) || {};

  const availableDates = Object.keys(slotsByDate).sort();

  // Calculate pricing based on consultation type
  const basePrice = doctorInfo?.consultationFee || 75.00;
  const videoPrice = basePrice;
  const audioPrice = Math.round(basePrice * 0.8); // 20% discount for audio

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading availability...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-800">
            <p className="font-medium">Unable to load availability</p>
            <p className="text-sm mt-1">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Doctor Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">{doctorInfo?.name || 'Dr. Fintan Ekochin'}</h3>
              <p className="text-sm text-gray-600">{doctorInfo?.specialization || 'General Medicine & Wellness'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultation Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Consultation Type</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={consultationType} onValueChange={(value: 'VIDEO' | 'AUDIO') => setConsultationType(value)}>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="VIDEO" id="video" />
              <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer flex-1">
                <Video className="h-4 w-4" />
                <div>
                  <p className="font-medium">Video Call</p>
                  <p className="text-sm text-gray-600">${videoPrice.toFixed(2)}</p>
                </div>
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <RadioGroupItem value="AUDIO" id="audio" />
              <Label htmlFor="audio" className="flex items-center gap-2 cursor-pointer flex-1">
                <Mic className="h-4 w-4" />
                <div>
                  <p className="font-medium">Audio Call</p>
                  <p className="text-sm text-gray-600">${audioPrice.toFixed(2)} (20% off)</p>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Month Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Available Appointments
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
          {availableDates.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No appointments available</p>
              <p className="text-sm text-gray-500 mt-1">
                Please check back later or try a different month
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableDates.map(date => (
                <div key={date} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">
                    {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {slotsByDate[date].map(slot => (
                      <Button
                        key={`${slot.date}-${slot.startTime}`}
                        variant={
                          selectedSlot?.date === slot.date && 
                          selectedSlot?.time === slot.startTime 
                            ? "default" 
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleSlotClick(slot.date, slot.startTime)}
                        className="text-xs"
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {slot.startTime}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected Appointment Summary */}
      {selectedSlot && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-800 mb-2">
              <Clock className="h-4 w-4" />
              <p className="font-medium">Selected Appointment</p>
            </div>
            <div className="space-y-1 text-sm">
              <p><strong>Date:</strong> {format(new Date(selectedSlot.date), 'EEEE, MMMM d, yyyy')}</p>
              <p><strong>Time:</strong> {selectedSlot.time}</p>
              <p><strong>Doctor:</strong> Dr. Fintan Ekochin</p>
              <p><strong>Type:</strong> 
                <Badge variant="outline" className="ml-2">
                  {consultationType === 'VIDEO' ? 'Video Call' : 'Audio Call'}
                </Badge>
              </p>
              <p><strong>Fee:</strong> ${consultationType === 'VIDEO' ? videoPrice.toFixed(2) : audioPrice.toFixed(2)}</p>
            </div>
            <Button 
              onClick={handleBookNow}
              disabled={createBooking.isPending}
              className="mt-3 w-full"
            >
              {createBooking.isPending ? 'Booking...' : `Book Now - $${consultationType === 'VIDEO' ? videoPrice.toFixed(2) : audioPrice.toFixed(2)}`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UnifiedBooking;
