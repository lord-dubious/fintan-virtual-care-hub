import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Activity, Clock, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminStatistics, useAdminAppointments } from '@/hooks/useAdmin';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const AppointmentItem = ({ patient, time, type }: { patient: string; time: string; type: string }) => {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{patient}</p>
        <p className="text-sm text-muted-foreground">{type}</p>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{time}</span>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const isMobile = useIsMobile();

  // Fetch real data from admin hooks
  const { data: adminStats, isLoading: statsLoading, error: statsError } = useAdminStatistics();
  const { data: appointmentsData, isLoading: appointmentsLoading, error: appointmentsError } = useAdminAppointments({ limit: 4 });

  // Transform API data to match UI expectations
  const stats = React.useMemo(() => {
    if (!adminStats) return [];

    return [
      {
        title: "Total Appointments",
        value: adminStats.totalAppointments.toString(),
        description: 'All-time appointments',
        icon: <Calendar className="h-4 w-4 text-muted-foreground" />
      },
      {
        title: "New Patients",
        value: adminStats.totalPatients.toString(),
        description: 'Total registered patients',
        icon: <Users className="h-4 w-4 text-muted-foreground" />
      },
      {
        title: "Total Revenue",
        value: `$${adminStats.totalRevenue.toLocaleString()}`,
        description: 'All-time revenue',
        icon: <DollarSign className="h-4 w-4 text-muted-foreground" />
      }
    ];
  }, [adminStats]);

  // Transform appointments data to match UI expectations
  const formattedAppointments = React.useMemo(() => {
    if (!appointmentsData?.appointments) return [];

    return appointmentsData.appointments.map(appointment => ({
      patient: appointment.patient?.name || 'Unknown Patient',
      time: format(new Date(appointment.scheduledAt), 'p'),
      type: `${appointment.consultationType.charAt(0).toUpperCase() + appointment.consultationType.slice(1).toLowerCase()} Consultation`
    }));
  }, [appointmentsData]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
        {statsLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : statsError ? (
          // Error state
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Failed to load dashboard statistics</p>
            </CardContent>
          </Card>
        ) : (
          // Real data
          stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={stat.icon}
            />
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>
            {appointmentsLoading
              ? "Loading appointments..."
              : appointmentsError
                ? "Failed to load appointments"
                : `You have ${formattedAppointments.length} consultations scheduled.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {appointmentsLoading ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : appointmentsError ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Failed to load upcoming appointments</p>
              </div>
            ) : formattedAppointments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No upcoming appointments</p>
              </div>
            ) : (
              formattedAppointments.map((appointment, index) => (
                <AppointmentItem
                  key={index}
                  patient={appointment.patient}
                  time={appointment.time}
                  type={appointment.type}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
