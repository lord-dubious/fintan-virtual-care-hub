import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { usePatientDashboard } from '@/hooks/usePatients';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  FileText,
  Pill,
  Video,
  Phone,
  MessageSquare,
  Bell,
  Activity,
  TrendingUp,
  Heart,
  Plus,
} from 'lucide-react';
import { DashboardSkeleton, ErrorState } from '@/components/LoadingStates';

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: dashboardData, isLoading, error } = usePatientDashboard();

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
    totalAppointments: 0,
    completedAppointments: 0,
    totalMedicalRecords: 0,
  };

  const upcomingAppointments = dashboardData?.upcomingAppointments?.slice(0, 3) || [];
  const nextAppointment = dashboardData?.nextAppointment;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Patient'}
          </h1>
          <p className="text-muted-foreground">
            Here's your health overview for today
          </p>
        </div>
        {!isMobile && (
          <Button asChild>
            <Link to="/booking">
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Link>
          </Button>
        )}
      </div>

      {/* Quick Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {upcomingAppointments.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Upcoming
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
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
            <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {stats.totalMedicalRecords}
            </div>
            <div className="text-sm text-muted-foreground">
              Records
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              Good
            </div>
            <div className="text-sm text-muted-foreground">
              Health Status
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Appointment */}
      {nextAppointment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Next Appointment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-lg">
                  {format(new Date(nextAppointment.date), 'EEEE, MMMM d')}
                </div>
                <div className="text-muted-foreground">
                  {format(new Date(nextAppointment.date), 'h:mm a')} • {nextAppointment.provider}
                </div>
                <Badge variant="secondary" className="mt-2">
                  {nextAppointment.consultationType === 'VIDEO' ? (
                    <><Video className="h-3 w-3 mr-1" /> Video Call</>
                  ) : (
                    <><Phone className="h-3 w-3 mr-1" /> Audio Call</>
                  )}
                </Badge>
              </div>
              <Button>
                Join Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/appointments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {appointment.provider.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(appointment.date), 'MMM d, h:mm a')}
                      </div>
                      <Badge variant="outline" className="mt-1">
                        {appointment.consultationType}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments</p>
                <Button asChild className="mt-4">
                  <Link to="/booking">Book Your First Appointment</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/records">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {dashboardData?.recentActivity?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentActivity.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/booking">
                <Calendar className="h-6 w-6" />
                Book Appointment
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/patient/messages">
                <MessageSquare className="h-6 w-6" />
                Send Message
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <Link to="/patient/records">
                <FileText className="h-6 w-6" />
                View Records
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Bell className="h-6 w-6" />
              Notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientDashboard;
