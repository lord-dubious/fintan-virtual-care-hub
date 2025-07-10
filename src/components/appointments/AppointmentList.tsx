import React from "react";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Video, Mic } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { consultationService } from '@/lib/services/consultationService';
import { useToast } from '@/hooks/use-toast';
import { ConsultationResponse, Consultation } from '@/types/consultation'; // Import Consultation as well
import { logger } from '@/lib/utils/monitoring';

import type { Appointment, AppointmentWithDetails } from '../../../shared/domain'; // Import Appointment and AppointmentWithDetails

interface AppointmentListProps {
  appointments: AppointmentWithDetails[]; // Change to AppointmentWithDetails
  isProvider?: boolean;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, isProvider = false }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [consultationStatus, setConsultationStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkConsultationStatus = async () => {
      if (appointments.length === 0) {
        setConsultationStatus({});
        return;
      }

      const appointmentIds = appointments.map(a => a.id);
      try {
        const result = await consultationService.getConsultationsByAppointmentIds(appointmentIds);
        if (result.success && result.data) {
          setConsultationStatus(result.data);
        } else {
          // Fallback if the batched call fails
          const statusMap: Record<string, string> = {};
          for (const appointment of appointments) {
            try {
              const singleResult = await consultationService.getConsultationByAppointmentId(appointment.id);
              if (singleResult.success && singleResult.data) {
                statusMap[appointment.id] = singleResult.data.status;
              } else {
                statusMap[appointment.id] = 'NOT_CREATED';
              }
            } catch (error: unknown) {
              const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
              logger.error('Error checking single consultation status:', errorData);
              statusMap[appointment.id] = 'ERROR';
            }
          }
          setConsultationStatus(statusMap);
        }
      } catch (error: unknown) {
        const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
        logger.error('Error checking batched consultation statuses:', errorData);
        // If batched call fails entirely, set all to error or handle as needed
        const statusMap: Record<string, string> = {};
        appointments.forEach(a => statusMap[a.id] = 'ERROR');
        setConsultationStatus(statusMap);
      }
    };
    
    checkConsultationStatus();
  }, [appointments]);

  const handleJoinConsultation = async (appointmentId: string) => {
    try {
      // Check if consultation exists
      let consultationId;
      const existingConsultation = await consultationService.getConsultationByAppointmentId(appointmentId);
      
      if (existingConsultation && existingConsultation.success && existingConsultation.data) { // Access consultation from data
        consultationId = existingConsultation.data.id; // Access id directly from data
      } else {
        // Create a new consultation
        const result = await consultationService.createConsultation(appointmentId);
        if (!result || !result.success || !result.data) { // Access consultation from data
          toast({
            title: 'Error',
            description: result?.message || 'Failed to create consultation',
            variant: 'destructive',
          });
          return;
        }
        consultationId = result.data.id; // Access id directly from data
      }
      
      // Navigate to consultation room
      navigate(`/consultation/${consultationId}`);
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error joining consultation:', errorData);
      toast({
        title: 'Error',
        description: 'Failed to join consultation',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Scheduled</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const isAppointmentActive = (appointment: AppointmentWithDetails) => { // Changed to AppointmentWithDetails
    const appointmentTime = new Date(appointment.appointmentDate).getTime();
    const now = new Date().getTime();
    const thirtyMinutesBefore = appointmentTime - 30 * 60 * 1000;
    const twoHoursAfter = appointmentTime + 2 * 60 * 60 * 1000;
    
    return now >= thirtyMinutesBefore && now <= twoHoursAfter && appointment.status === 'SCHEDULED';
  };

  const getConsultationTypeIcon = (type: string) => {
    if (type === 'VIDEO') {
      return <Video className="h-4 w-4 mr-1" />;
    } else {
      return <Mic className="h-4 w-4 mr-1" />;
    }
  };

  if (appointments.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">No appointments found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {isProvider ? appointment.patient??.user?.name || 'Unknown Patient' : appointment.provider??.user?.name || 'Unknown Provider'}
              </CardTitle>
              {getStatusBadge(appointment.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(appointment.appointmentDate.toISOString())}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                {new Date(appointment.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                {getConsultationTypeIcon(appointment.consultationType)}
                {appointment.consultationType === 'VIDEO' ? 'Video Call' : 'Audio Call'}
              </div>
              {appointment.reason && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Reason:</p>
                  <p className="text-sm text-gray-600">{appointment.reason}</p>
                </div>
              )}
              <div className="mt-4">
                {isAppointmentActive(appointment) ? (
                  <Button 
                    onClick={() => handleJoinConsultation(appointment.id)}
                    className="w-full"
                  >
                    Join {appointment.consultationType === 'VIDEO' ? 'Video' : 'Audio'} Call
                  </Button>
                ) : (
                  <Button 
                    disabled
                    variant="outline" 
                    className="w-full"
                  >
                    {appointment.status === 'COMPLETED' 
                      ? 'Consultation Completed' 
                      : 'Not Available Yet'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentList;
