import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useProviderAppointments } from '@/hooks/useProviderDashboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Video,
  Phone,
  Search,
  Filter,
  Plus,
  User,
  FileText,
  MessageSquare,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InlineLoader, ErrorState, EmptyState } from '@/components/LoadingStates';

const DoctorAppointments: React.FC = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('today');

  // Mock data - in real app this would come from API
  const { 
    data: appointmentsData, 
    isLoading 
  } = useProviderAppointments();

  const todaysAppointments = appointmentsData?.todaysAppointments || [];
  const upcomingAppointments = appointmentsData?.upcomingAppointments || [];
  const pastAppointments = appointmentsData?.pastAppointments || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'no-show':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'no-show':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const AppointmentCard: React.FC<{ appointment: any }> = ({ appointment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="font-semibold text-lg">
                {appointment.patient?.user?.name || 'Unknown Patient'}
              </div>
              <Badge className={getStatusColor(appointment.status)}>
                {getStatusIcon(appointment.status)}
                <span className="ml-1">{appointment.status}</span>
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(appointment.appointmentDate), 'EEEE, MMMM d, yyyy')}
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {format(new Date(appointment.appointmentDate), 'h:mm a')} 
                ({appointment.duration} minutes)
              </div>
              
              <div className="flex items-center gap-2">
                {appointment.consultationType === 'VIDEO' ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                {appointment.consultationType} Consultation
              </div>
              
              {appointment.reason && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {appointment.reason}
                </div>
              )}

              {appointment.patient?.user?.email && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {appointment.patient.user.email}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {appointment.status === 'CONFIRMED' && (
              <Button size="sm">
                Start Consultation
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  View Patient Records
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Patient
                </DropdownMenuItem>
                {appointment.status === 'SCHEDULED' && (
                  <>
                    <DropdownMenuItem>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Appointment
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Calendar className="h-4 w-4 mr-2" />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </DropdownMenuItem>
                  </>
                )}
                {appointment.status === 'COMPLETED' && (
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    Add Medical Record
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your patient appointments and schedule
          </p>
        </div>
        <Button asChild>
          <Link to="/doctor/appointments/new">
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Appointments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-4'}`}>
          <TabsTrigger value="today">
            Today ({todaysAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastAppointments.length})
          </TabsTrigger>
          {!isMobile && (
            <TabsTrigger value="all">
              All
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {isLoading ? (
            <InlineLoader message="Loading today's appointments..." />
          ) : todaysAppointments.length > 0 ? (
            <div className="space-y-4">
              {todaysAppointments
                .filter(apt => 
                  !searchTerm || 
                  apt.patient?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
            </div>
          ) : (
            <EmptyState
              title="No Appointments Today"
              message="You don't have any appointments scheduled for today."
              icon={<Calendar className="h-12 w-12 text-muted-foreground" />}
            />
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <InlineLoader message="Loading upcoming appointments..." />
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments
                .filter(apt => 
                  !searchTerm || 
                  apt.patient?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
            </div>
          ) : (
            <EmptyState
              title="No Upcoming Appointments"
              message="You don't have any upcoming appointments scheduled."
              action={{
                label: "Schedule New Appointment",
                onClick: () => window.location.href = '/doctor/appointments/new'
              }}
              icon={<Clock className="h-12 w-12 text-muted-foreground" />}
            />
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <InlineLoader message="Loading past appointments..." />
          ) : pastAppointments.length > 0 ? (
            <div className="space-y-4">
              {pastAppointments
                .filter(apt => 
                  !searchTerm || 
                  apt.patient?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
            </div>
          ) : (
            <EmptyState
              title="No Past Appointments"
              message="You haven't had any appointments yet."
              icon={<Clock className="h-12 w-12 text-muted-foreground" />}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorAppointments;
