
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Activity, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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

  // Mock data
  const stats = [
    { 
      title: "Total Appointments", 
      value: "38", 
      description: "12% increase from last month", 
      icon: <Calendar className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: "New Patients", 
      value: "14", 
      description: "7% increase from last month", 
      icon: <Users className="h-4 w-4 text-muted-foreground" /> 
    },
    { 
      title: "Consultation Hours", 
      value: "27.5", 
      description: "Total hours this week", 
      icon: <Activity className="h-4 w-4 text-muted-foreground" /> 
    }
  ];

  const upcomingAppointments = [
    { patient: "John Doe", time: "Today, 10:00 AM", type: "Video Consultation" },
    { patient: "Jane Smith", time: "Today, 11:30 AM", type: "Audio Consultation" },
    { patient: "Robert Johnson", time: "Today, 2:00 PM", type: "Video Consultation" },
    { patient: "Emily Williams", time: "Tomorrow, 9:15 AM", type: "Audio Consultation" }
  ];

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
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>You have {upcomingAppointments.length} consultations scheduled.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment, index) => (
              <AppointmentItem
                key={index}
                patient={appointment.patient}
                time={appointment.time}
                type={appointment.type}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
