import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Video, 
  Phone, 
  MapPin,
  User,
  FileText,
  Bell,
  ChevronRight,
  Plus
} from 'lucide-react';
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { Link } from 'react-router-dom';

interface AppointmentDetails {
  id: string;
  appointmentDate: Date;
  reason: string;
  consultationType: 'VIDEO' | 'AUDIO' | 'IN_PERSON';
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  provider: {
    id: string;
    name: string;
    specialization?: string;
    profilePicture?: string;
  };
  notes?: string;
  duration?: number;
  location?: string;
  meetingLink?: string;
  canJoin?: boolean;
  canReschedule?: boolean;
  canCancel?: boolean;
}

interface UpcomingAppointmentsProps {
  appointments: AppointmentDetails[];
  isLoading?: boolean;
  onJoinCall?: (appointmentId: string) => void;
  onReschedule?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  maxItems?: number;
}

const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({ 
  appointments, 
  isLoading = false,
  onJoinCall,
  onReschedule,
  onCancel,
  maxItems = 3
}) => {
  const getConsultationIcon = (type: AppointmentDetails['consultationType']) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="h-4 w-4" />;
      case 'AUDIO':
        return <Phone className="h-4 w-4" />;
      case 'IN_PERSON':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: AppointmentDetails['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const displayedAppointments = appointments.slice(0, maxItems);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <Link to="/booking">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Book
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No upcoming appointments</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Schedule your next consultation with Dr. Fintan
            </p>
            <Link to="/booking">
              <Button className="mt-4">
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
          <Link to="/booking">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Book
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {getDateLabel(appointment.appointmentDate)}
                    </h4>
                    <Badge variant="outline" className={getStatusColor(appointment.status)}>
                      {appointment.status.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Clock className="h-3 w-3" />
                    <span>{format(appointment.appointmentDate, 'h:mm a')}</span>
                    {appointment.duration && (
                      <span>• {appointment.duration} min</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-3 w-3" />
                    <span>{appointment.provider.name}</span>
                    {appointment.provider.specialization && (
                      <span className="text-xs text-gray-500">
                        • {appointment.provider.specialization}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getConsultationIcon(appointment.consultationType)}
                  <span className="text-xs text-gray-500 capitalize">
                    {appointment.consultationType.toLowerCase()}
                  </span>
                </div>
              </div>

              {appointment.reason && (
                <div className="mb-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <FileText className="h-3 w-3" />
                    <span>Reason for visit</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {appointment.reason}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(appointment.appointmentDate, { addSuffix: true })}
                </div>
                <div className="flex items-center gap-2">
                  {appointment.canJoin && onJoinCall && (
                    <Button 
                      size="sm" 
                      onClick={() => onJoinCall(appointment.id)}
                      className="h-7 px-3 text-xs"
                    >
                      <Video className="h-3 w-3 mr-1" />
                      Join
                    </Button>
                  )}
                  {appointment.canReschedule && onReschedule && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onReschedule(appointment.id)}
                      className="h-7 px-3 text-xs"
                    >
                      Reschedule
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-7 px-2">
                    <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {appointments.length > maxItems && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="ghost" className="w-full" size="sm">
              View All Appointments ({appointments.length})
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingAppointments;
