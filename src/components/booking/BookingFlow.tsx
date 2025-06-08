import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/authProvider';
import { appointmentService } from '@/lib/services/appointmentService';
import { notificationService, NotificationType } from '@/lib/services/notificationService';
import { TimeSlot } from '@/lib/services/calendarService';
import { AppointmentCalendar } from '@/components/calendar/AppointmentCalendar';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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

      if (result.success && result.appointment) {
        // Create notification
        await notificationService.notifyAppointmentCreated(result.appointment.id);

        toast({
          title: 'Appointment Booked',
          description: `Your appointment with ${providerName} has been scheduled for ${format(
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

            <div className="space-y-2">
              <Label>Consultation Type</Label>
              <RadioGroup
                value={consultationType}
                onValueChange={(value) => setConsultationType(value as 'VIDEO' | 'AUDIO')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="VIDEO" id="video" />
                  <Label htmlFor="video">Video Call</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="AUDIO" id="audio" />
                  <Label htmlFor="audio">Audio Call</Label>
                </div>
              </RadioGroup>
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

