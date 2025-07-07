import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Video, Phone } from 'lucide-react';
import NewBookingCalendar from '@/components/booking/NewBookingCalendar';
import { useToast } from '@/hooks/use-toast';

const NewBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Get provider ID from URL params or use default
  const providerId = searchParams.get('providerId') || process.env.VITE_DEFAULT_PROVIDER_ID || 'cmcskh5uw0003jhvff9r7utpw';
  const [consultationType, setConsultationType] = useState<'VIDEO' | 'AUDIO'>('VIDEO');
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);

  const handleSlotSelected = (date: string, time: string) => {
    setSelectedSlot({ date, time });
    console.log('🎯 Slot selected:', { date, time });
  };

  const handleBookingComplete = (appointmentData: any) => {
    console.log('✅ Booking completed:', appointmentData);
    
    toast({
      title: "Appointment Booked!",
      description: "Your appointment has been successfully scheduled.",
    });

    // Navigate to confirmation or dashboard
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleConsultationTypeChange = (type: 'VIDEO' | 'AUDIO') => {
    setConsultationType(type);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Book Your Appointment
            </h1>
            <p className="text-gray-600">
              Select your preferred date and time for your consultation
            </p>
          </div>
        </div>

        {/* Consultation Type Selection */}
        <Card className="w-full max-w-4xl mx-auto mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Consultation Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={consultationType === 'VIDEO' ? 'default' : 'outline'}
                onClick={() => handleConsultationTypeChange('VIDEO')}
                className="flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Video Call
              </Button>
              <Button
                variant={consultationType === 'AUDIO' ? 'default' : 'outline'}
                onClick={() => handleConsultationTypeChange('AUDIO')}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Audio Call
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {consultationType === 'VIDEO' 
                ? 'Face-to-face video consultation with your healthcare provider'
                : 'Voice-only consultation with your healthcare provider'
              }
            </p>
          </CardContent>
        </Card>

        {/* Booking Calendar */}
        <NewBookingCalendar
          providerId={providerId}
          consultationType={consultationType}
          onSlotSelected={handleSlotSelected}
          onBookingComplete={handleBookingComplete}
        />

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="w-full max-w-4xl mx-auto mt-6">
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Provider ID:</strong> {providerId}</p>
                <p><strong>Consultation Type:</strong> {consultationType}</p>
                <p><strong>Selected Slot:</strong> {selectedSlot ? `${selectedSlot.date} at ${selectedSlot.time}` : 'None'}</p>
                <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="w-full max-w-4xl mx-auto mt-6">
          <CardHeader>
            <CardTitle>How to Book</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">1</Badge>
                <div>
                  <p className="font-medium">Choose Consultation Type</p>
                  <p className="text-sm text-gray-600">Select between video or audio consultation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">2</Badge>
                <div>
                  <p className="font-medium">Select Date</p>
                  <p className="text-sm text-gray-600">Click on an available date in the calendar</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">3</Badge>
                <div>
                  <p className="font-medium">Choose Time</p>
                  <p className="text-sm text-gray-600">Pick from available time slots</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-1">4</Badge>
                <div>
                  <p className="font-medium">Confirm Booking</p>
                  <p className="text-sm text-gray-600">Review details and confirm your appointment</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewBookingPage;
