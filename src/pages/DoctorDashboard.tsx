import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useProviderDashboard, useProviderAppointments } from '@/hooks/useProviderDashboard';
import { Navigate } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Users,
  Video,
  Settings,
  Bell,
  MessageSquare,
  Stethoscope,
  TrendingUp,
  ChevronRight,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { DashboardSkeleton, NetworkStatus } from '@/components/LoadingStates';

// Define types for appointment data
interface AppointmentData {
  id: string;
  appointmentDate: string;
  status: string;
  consultationType?: string;
  reason?: string;
  patient?: {
    user?: {
      name?: string;
    };
  };
}

interface AppointmentsResponse {
  appointments: AppointmentData[];
}

// Lazy load heavy components
const DoctorSettings = React.lazy(() => import('@/components/dashboard/DoctorSettings'));

const DoctorDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Performance monitoring would go here if needed

  // Fetch real dashboard data
  const { data: dashboardData, isLoading: isLoadingDashboard, error: dashboardError } = useProviderDashboard();
  const { data: appointmentsData } = useProviderAppointments({
    status: 'SCHEDULED,CONFIRMED',
    limit: 20
  });

  // Process real dashboard data - moved before conditional returns
  const todayStats = React.useMemo(() => {
    if (dashboardData?.statistics) {
      return {
        appointments: dashboardData.statistics.todaysAppointmentCount,
        patients: dashboardData.statistics.totalPatients,
        consultations: dashboardData.statistics.completedAppointments,
        revenue: dashboardData.provider.consultationFee ?
          dashboardData.statistics.completedAppointments * dashboardData.provider.consultationFee : 0
      };
    }

    // Fallback mock data
    return {
      appointments: 0,
      patients: 0,
      consultations: 0,
      revenue: 0
    };
  }, [dashboardData]);

  const upcomingAppointments = React.useMemo(() => {
    if (dashboardData?.todaysAppointments) {
      return dashboardData.todaysAppointments.map(apt => ({
        id: apt.id,
        patient: apt.patient.name,
        time: format(new Date(apt.date), 'h:mm a'),
        type: apt.consultationType === 'VIDEO' ? 'Video Consultation' : 'Audio Consultation',
        status: apt.status.toLowerCase(),
        reason: apt.reason
      }));
    }

    // Fallback to appointments data
    if (appointmentsData && typeof appointmentsData === 'object' && 'appointments' in appointmentsData) {
      return (appointmentsData as AppointmentsResponse).appointments.slice(0, 5).map((apt: AppointmentData) => ({
        id: apt.id,
        patient: apt.patient?.user?.name || 'Unknown Patient',
        time: format(new Date(apt.appointmentDate), 'h:mm a'),
        type: apt.consultationType === 'VIDEO' ? 'Video Consultation' : 'Audio Consultation',
        status: apt.status.toLowerCase(),
        reason: apt.reason
      }));
    }

    return [];
  }, [dashboardData, appointmentsData]);

  // Recent patients data would be processed here if needed

  // Debug logging
  console.log('🏥 DoctorDashboard Debug:', {
    isAuthenticated,
    userRole: user?.role,
    userName: user?.name,
    userEmail: user?.email
  });

  // Redirect if not authenticated or not a doctor/provider
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user?.role !== 'DOCTOR' && user?.role !== 'PROVIDER') {
    return <Navigate to="/dashboard" replace />;
  }

  // Loading state
  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900">
        <div className={`${isMobile ? 'mobile-content p-4' : 'container mx-auto px-4 py-8'}`}>
          <DashboardSkeleton />
        </div>
        <NetworkStatus />
      </div>
    );
  }

  // Error state
  if (dashboardError && !dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to load dashboard data. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-green-900 ${isMobile ? 'mobile-app-container' : ''}`}>
      <div className={`${isMobile ? 'mobile-content p-4' : 'container mx-auto px-4 py-8'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 dark:text-gray-100`}>
              Good morning, Dr. {dashboardData?.provider?.name?.split(' ')[0] || user?.name?.split(' ')[0] || 'Doctor'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {dashboardData?.provider?.specialization ?
                `${dashboardData.provider.specialization} • Ready to help your patients today` :
                'Ready to help your patients today'
              }
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {!isMobile && 'Settings'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            {!isMobile && <TabsTrigger value="patients">Patients</TabsTrigger>}
            {!isMobile && <TabsTrigger value="records">Records</TabsTrigger>}
            <TabsTrigger value="settings">Settings</TabsTrigger>
            {isMobile && <TabsTrigger value="more">More</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Today's Stats */}
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {todayStats.appointments}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Today's Appointments
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {todayStats.patients}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Patients Today
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Video className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {todayStats.consultations}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Consultations
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ${todayStats.revenue}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Today's Revenue
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Today's Schedule</CardTitle>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Appointment
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {appointment.patient}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {appointment.type} • {appointment.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                          {appointment.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            {dashboardData?.pendingTasks && dashboardData.pendingTasks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Pending Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.pendingTasks.map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {task.description}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {task.count} item{task.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                          {task.priority}
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
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Video className="h-6 w-6" />
                    Start Consultation
                  </Button>
                  
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    Write Prescription
                  </Button>
                  
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Users className="h-6 w-6" />
                    View Patients
                  </Button>
                  
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <MessageSquare className="h-6 w-6" />
                    Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Appointment management interface will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Patient management interface will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Medical Records</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Medical records interface will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mobile More Tab */}
          {isMobile && (
            <TabsContent value="more" className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Patients</div>
                  </CardContent>
                </Card>
                
                <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-sm font-medium">Records</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Settings Tab */}
          <TabsContent value="settings">
            <React.Suspense fallback={<div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>}>
              <DoctorSettings />
            </React.Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;
