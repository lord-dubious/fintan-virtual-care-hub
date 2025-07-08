import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/authProvider';
import { appointmentService } from '@/lib/services/appointmentService';
import { TimeSlot } from '@/lib/services/calendarService';
import { AppointmentCalendar } from '@/components/calendar/AppointmentCalendar';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { usePatientProfileForBooking } from '@/hooks/usePatientProfile';
import { CheckCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { Mic, Video, Check, Info } from 'lucide-react';

interface BookingFlowProps {
  providerId: string;
  providerName: string;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({ providerId, providerName }) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>(undefined);
  const [consultationType, setConsultationType] = useState<'VIDEO' | 'AUDIO'>('VIDEO');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get patient profile data for auto-population
  const {
    isLoading: isLoadingProfile,
    isProfileComplete
  } = usePatientProfileForBooking();

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(undefined);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
  };

  // Go to next step
  const goToNextStep = () => {
    if (step === 1 && !selectedDate) {
      toast({
        title: 'Please select a date',
        description: 'You must select a date to continue',
        variant: 'destructive',
      });
      return;
    }

    if (step === 2 && !selectedTimeSlot) {
      toast({
        title: 'Please select a time slot',
        description: 'You must select a time slot to continue',
        variant: 'destructive',
      });
      return;
    }

    setStep(step + 1);
  };

  // Go to previous step
  const goToPreviousStep = () => {
    setStep(step - 1);
  };

  // Book appointment
  const bookAppointment = async () => {
    if (!user || !selectedDate || !selectedTimeSlot) return;

    setLoading(true);
    try {
      // Create appointment
      const appointmentDate = new Date(selectedTimeSlot.startTime);
      const result = await appointmentService.createAppointment({
        providerId,
        patientId: user.id,
        consultationType,
        appointmentDate,
        reason,
      });

      if (result.success && result.data) {
        toast({
          title: 'Appointment Booked',
          description: `Your ${consultationType.toLowerCase()} appointment with ${providerName} has been scheduled for ${format(
            appointmentDate,
            'EEEE, MMMM d, yyyy \'at\' h:mm a'
          )}`,
        });

        // Navigate to appointments page
        navigate('/patient/appointments');
      } else {
        toast({
          title: 'Booking Failed',
          description: result.message || 'Failed to book appointment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Booking Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Book an Appointment with {providerName}</CardTitle>
        <CardDescription>
          {step === 1
            ? 'Select a date for your appointment'
            : step === 2
            ? 'Select a time slot for your appointment'
            : 'Provide details for your appointment'}
        </CardDescription>

        {/* Profile Status Indicator */}
        {user && !isLoadingProfile && (
          <div className="mt-4">
            {isProfileComplete ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Profile Complete!</strong> Your personal information is saved and will be used for this appointment.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-blue-200 bg-blue-50">
                <User className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Quick Booking:</strong> Complete your profile after booking to save time on future appointments.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <AppointmentCalendar
            providerId={providerId}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        )}

        {step === 2 && selectedDate && (
          <TimeSlotPicker
            providerId={providerId}
            selectedDate={selectedDate}
            onTimeSlotSelect={handleTimeSlotSelect}
            selectedTimeSlot={selectedTimeSlot}
          />
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Appointment Details</h3>
              <p className="text-gray-500">
                <strong>Date:</strong> {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-gray-500">
                <strong>Time:</strong>{' '}
                {selectedTimeSlot &&
                  `${format(selectedTimeSlot.startTime, 'h:mm a')} - ${format(
                    selectedTimeSlot.endTime,
                    'h:mm a'
                  )}`}
              </p>
              <p className="text-gray-500">
                <strong>Provider:</strong> {providerName}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Consultation Type</h3>
              
              <RadioGroup
                value={consultationType}
                onValueChange={(value) => setConsultationType(value as 'VIDEO' | 'AUDIO')}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  consultationType === 'VIDEO' ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}>
                  <RadioGroupItem value="VIDEO" id="video" className="sr-only" />
                  <Label htmlFor="video" className="flex flex-col items-center cursor-pointer">
                    <div className="bg-primary/10 rounded-full p-4 mb-3">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                    <span className="text-lg font-medium mb-1">Video Call</span>
                    <p className="text-sm text-gray-500 text-center">
                      Face-to-face consultation with video and audio
                    </p>
                    <ul className="text-sm text-gray-500 mt-3 space-y-1">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        See and hear your provider
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Show symptoms visually
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Best for most consultations
                      </li>
                    </ul>
                  </Label>
                </div>
                
                <div className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  consultationType === 'AUDIO' ? 'border-primary bg-primary/5' : 'border-gray-200'
                }`}>
                  <RadioGroupItem value="AUDIO" id="audio" className="sr-only" />
                  <Label htmlFor="audio" className="flex flex-col items-center cursor-pointer">
                    <div className="bg-blue-50 rounded-full p-4 mb-3">
                      <Mic className="h-8 w-8 text-blue-500" />
                    </div>
                    <span className="text-lg font-medium mb-1">Audio Call</span>
                    <p className="text-sm text-gray-500 text-center">
                      Voice-only consultation without video
                    </p>
                    <ul className="text-sm text-gray-500 mt-3 space-y-1">
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        Lower bandwidth required
                      </li>
                      <li className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                        More privacy during call
                      </li>
                      <li className="flex items-center">
                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                        Provider may request video if needed
                      </li>
                    </ul>
                  </Label>
                </div>
              </RadioGroup>
              
              {consultationType === 'AUDIO' && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>About Audio Calls</AlertTitle>
                  <AlertDescription>
                    During an audio call, your healthcare provider may request to enable video if needed for better diagnosis. 
                    You will always be asked for consent before video is enabled.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                placeholder="Please describe the reason for your appointment"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={goToPreviousStep}>
            Back
          </Button>
        ) : (
          <div></div>
        )}
        {step < 3 ? (
          <Button onClick={goToNextStep}>Next</Button>
        ) : (
          <Button onClick={bookAppointment} disabled={loading}>
            {loading ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                Booking...
              </>
            ) : (
              'Book Appointment'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

