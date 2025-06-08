import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { appointmentService } from '@/lib/services/appointmentService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mic, Video } from 'lucide-react';

interface AppointmentListProps {
  appointments: any[];
  isProvider: boolean;
  onRefresh: () => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  isProvider,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Format appointment status
  const formatStatus = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'outline';
      case 'CONFIRMED':
        return 'secondary';
      case 'IN_PROGRESS':
        return 'default';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // Check if it's time to join the appointment
  const isTimeToJoin = (appointmentDate: string) => {
    const now = new Date();
    const appointmentTime = new Date(appointmentDate);
    const diffMs = appointmentTime.getTime() - now.getTime();
    const diffMins = diffMs / 60000;
    
    // Allow joining 10 minutes before and up to 30 minutes after the appointment time
    return diffMins <= 10 && diffMins >= -30;
  };

  // View appointment details
  const viewAppointment = (appointmentId: string) => {
    navigate(`/appointments/${appointmentId}`);
  };

  // Join consultation
  const joinConsultation = async (appointmentId: string) => {
    try {
      const result = await appointmentService.joinConsultation(appointmentId);
      if (result.success && result.consultation) {
        navigate(`/consultation/${result.consultation.id}`);
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to join consultation',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error joining consultation:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  // Cancel appointment
  const cancelAppointment = async (appointmentId: string) => {
    try {
      const result = await appointmentService.cancelAppointment(appointmentId);
      if (result.success) {
        toast({
          title: 'Appointment Cancelled',
          description: 'The appointment has been cancelled successfully',
        });
        onRefresh();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to cancel appointment',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No appointments found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date & Time</TableHead>
          <TableHead>{isProvider ? 'Patient' : 'Provider'}</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell>
              {format(new Date(appointment.appointmentDate), 'PPP p')}
            </TableCell>
            <TableCell>
              {isProvider 
                ? appointment.patient.user.name 
                : appointment.provider.user.name}
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                {appointment.consultationType === 'VIDEO' ? (
                  <>
                    <Video className="h-4 w-4 mr-2 text-green-500" />
                    <span>Video</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2 text-blue-500" />
                    <span>Audio</span>
                  </>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(appointment.status)}>
                {formatStatus(appointment.status)}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => viewAppointment(appointment.id)}
                >
                  View
                </Button>
                
                {appointment.status === 'SCHEDULED' && (
                  <>
                    {isTimeToJoin(appointment.appointmentDate) && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => joinConsultation(appointment.id)}
                      >
                        Join
                      </Button>
                    )}
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => cancelAppointment(appointment.id)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

