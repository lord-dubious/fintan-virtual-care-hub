import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProviderDashboard } from '@/hooks/useProviderDashboard';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Video,
  Phone,
  MessageSquare,
  TrendingUp,
  Activity,
  Plus,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { DashboardSkeleton, ErrorState } from '@/components/LoadingStates';

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: dashboardData, isLoading, error } = useProviderDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Dashboard Unavailable"
        message="We're having trouble loading your dashboard. Please try again."
      />
    );
  }

  const stats = dashboardData?.statistics || {
    todaysAppointmentCount: 0,
    totalPatients: 0,
    completedAppointments: 0,
    upcomingAppointmentCount: 0,
  };

  const todaysAppointments = dashboardData?.todaysAppointments?.slice(0, 5) || [];
  const upcomingAppointments = dashboardData?.upcomingAppointments?.slice(0, 3) || [];
  const recentPatients = dashboardData?.recentPatients?.slice(0, 4) || [];

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Good {getTimeOfDay()}, Dr. {user?.name?.split(' ')[0] || 'Doctor'}
          </h1>
          <p className="text-muted-foreground">
            Here's your practice overview for today
          </p>
        </div>
        {!isMobile && (
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/doctor/appointments/new">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Link>
            </Button>
            <Button asChild>
              <Link to="/doctor/records/new">
                <FileText className="h-4 w-4 mr-2" />
                New Record
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {stats.todaysAppointmentCount}
            </div>
            <div className="text-sm text-muted-foreground">
              Today's Appointments
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {stats.totalPatients}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Patients
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {stats.completedAppointments}
            </div>
            <div className="text-sm text-muted-foreground">
              Completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {stats.upcomingAppointmentCount}
            </div>
            <div className="text-sm text-muted-foreground">
              Upcoming
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Schedule
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/appointments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length > 0 ? (
              <div className="space-y-4">
                {todaysAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                      <div>
                        <div className="font-medium">
                          {appointment.patient?.user?.name || 'Unknown Patient'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(appointment.appointmentDate), 'h:mm a')} • 
                          {appointment.duration} min
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {appointment.consultationType === 'VIDEO' ? (
                              <><Video className="h-3 w-3 mr-1" /> Video</>
                            ) : (
                              <><Phone className="h-3 w-3 mr-1" /> Audio</>
                            )}
                          </Badge>
                          {appointment.reason && (
                            <span className="text-xs text-muted-foreground">
                              {appointment.reason}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      {appointment.status === 'CONFIRMED' && (
                        <Button size="sm">
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Patients
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/patients">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPatients.length > 0 ? (
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {patient.user?.name || 'Unknown Patient'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Last visit: {patient.lastVisit ? 
                            format(new Date(patient.lastVisit), 'MMM d, yyyy') : 
                            'No previous visits'
                          }
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Records
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent patient activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming This Week
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/doctor/appointments">View Schedule</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border rounded-lg">
                  <div className="font-medium">
                    {appointment.patient?.user?.name || 'Unknown Patient'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(appointment.appointmentDate), 'EEE, MMM d')} at{' '}
                    {format(new Date(appointment.appointmentDate), 'h:mm a')}
                  </div>
                  <Badge variant="outline" className="mt-2">
                    {appointment.consultationType}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/doctor/appointments/new">
                <Calendar className="h-6 w-6" />
                Schedule Appointment
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/doctor/records/new">
                <FileText className="h-6 w-6" />
                Create Record
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/doctor/messages">
                <MessageSquare className="h-6 w-6" />
                Messages
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/doctor/patients">
                <Users className="h-6 w-6" />
                Patient List
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
