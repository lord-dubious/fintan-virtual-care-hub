import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { usePatientDashboard, usePatientMedicalRecords } from '@/hooks/usePatients';
import { useAppointments } from '@/hooks/useAppointments';
import { usePatientActivity } from '@/hooks/usePatientActivity';
import { Navigate, Link } from 'react-router-dom';

import {
  Calendar,
  Clock,
  FileText,
  Pill,
  User,
  Video,
  Phone,
  Download,
  Settings,
  Bell,
  MessageSquare,
  Activity,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { DashboardSkeleton, ErrorState, NetworkStatus, InlineLoader } from '@/components/LoadingStates';
import { usePerformanceMonitor } from '@/hooks/usePerformance';
import { screenReader } from '@/utils/accessibility';
import { AppointmentStatus, MedicalRecord } from '../../shared/domain'; // Import canonical types
import { ApiAppointment } from '@/api/appointments'; // Explicitly import ApiAppointment
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';

// Lazy load heavy components for better performance
const PatientSettings = React.lazy(() => import('@/components/dashboard/PatientSettings'));

// Define UI-specific appointment type
interface AppointmentUI {
  id: string;
  date: Date;
  time: string;
  type: 'video' | 'audio';
  status: 'scheduled' | 'completed' | 'cancelled';
  doctor: string;
  notes?: string;
  reason?: string; // Add reason to UI type
}

// Define UI-specific prescription type
interface PrescriptionUI {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'discontinued';
  instructions: string;
}

// Define UI-specific health record type
interface HealthRecordUI {
  id: string;
  date: Date;
  type: 'consultation' | 'lab_result' | 'prescription' | 'note';
  title: string;
  content: string;
  attachments?: string[];
}


const PatientDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Performance monitoring
  // const { logPerformance } = usePerformanceMonitor('PatientDashboard'); // Commented out as not used
  usePerformanceMonitor('PatientDashboard'); // Keep the hook call for side effects
  // const { prefetchOnHover } = usePrefetch(); // Commented out as not currently used

  // Announce tab changes to screen readers
  React.useEffect(() => {
    const tabNames = {
      overview: 'Overview',
      appointments: 'Appointments',
      prescriptions: 'Prescriptions',
      records: 'Health Records',
      settings: 'Settings',
      more: 'More options'
    };

    if (activeTab && tabNames[activeTab as keyof typeof tabNames]) {
      screenReader.announce(`Switched to ${tabNames[activeTab as keyof typeof tabNames]} section`);
    }
  }, [activeTab]);
  
  // Get data from real API
  const { data: dashboardData, isLoading: isLoadingDashboard, error: dashboardError } = usePatientDashboard();
  const { data: appointmentsResponse, isLoading: isLoadingAppointments } = useAppointments({ status: 'all' as AppointmentStatus }); // Cast "all"
  const { data: medicalRecords, isLoading: isLoadingRecords } = usePatientMedicalRecords();
  const { activities, isLoading: isLoadingActivity } = usePatientActivity();

  // Memoized data processing for performance
  const upcomingAppointments = React.useMemo(() => {
    // const startTime = Date.now(); // Performance tracking commented out
    // let result; // Unused variable commented out
    if (dashboardData?.upcomingAppointments) {
      return dashboardData.upcomingAppointments.map(apt => ({
        id: apt.id,
        date: new Date(apt.date),
        time: format(new Date(apt.date), 'h:mm a'),
        type: apt.consultationType.toLowerCase() as 'video' | 'audio',
        status: apt.status.toLowerCase() as 'scheduled' | 'completed' | 'cancelled',
        doctor: apt.provider.name,
        notes: apt.reason || '',
        reason: apt.reason
      }));
    }

    // Fallback to old API
    const apiAppointments = appointmentsResponse?.appointments || [];
    return apiAppointments
      .filter((apt: ApiAppointment) => apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED')
      .slice(0, 3)
      .map((apt: ApiAppointment) => ({
        id: apt.id,
        date: apt.appointmentDate,
        time: format(apt.appointmentDate, 'h:mm a'),
        type: (apt.consultationType || 'VIDEO').toLowerCase() as 'video' | 'audio',
        status: (apt.status || 'SCHEDULED').toLowerCase() as 'scheduled' | 'completed' | 'cancelled',
        doctor: apt.provider?.user?.name || 'Dr. Fintan Ekochin',
        notes: apt.consultation?.notes || apt.reason || '',
        reason: apt.reason
      }));
  }, [dashboardData, appointmentsResponse]);

  const recentAppointments = React.useMemo(() => {
    if (dashboardData?.recentAppointments) {
      return dashboardData.recentAppointments.map(apt => ({
        id: apt.id,
        date: new Date(apt.date),
        time: format(new Date(apt.date), 'h:mm a'),
        type: apt.consultationType.toLowerCase() as 'video' | 'audio',
        status: apt.status.toLowerCase() as 'scheduled' | 'completed' | 'cancelled',
        doctor: apt.provider.name,
        notes: apt.reason || '',
        reason: apt.reason
      }));
    }

    // Fallback to old API
    const apiAppointments = appointmentsResponse?.appointments || [];
    return apiAppointments
      .filter((apt: ApiAppointment) => apt.status === 'COMPLETED')
      .slice(0, 5)
      .map((apt: ApiAppointment) => ({
        id: apt.id,
        date: apt.appointmentDate,
        time: format(apt.appointmentDate, 'h:mm a'),
        type: (apt.consultationType || 'VIDEO').toLowerCase() as 'video' | 'audio',
        status: (apt.status || 'SCHEDULED').toLowerCase() as 'scheduled' | 'completed' | 'cancelled',
        doctor: apt.provider?.user?.name || 'Dr. Fintan Ekochin',
        notes: apt.consultation?.notes || apt.reason || '',
        reason: apt.reason
      }));
  }, [dashboardData, appointmentsResponse]);

  // Combine for legacy compatibility
  const appointments: AppointmentUI[] = React.useMemo(() => {
    return [...upcomingAppointments, ...recentAppointments].map(apt => ({
      ...apt,
      reason: apt.reason || undefined // Convert null to undefined
    }));
  }, [upcomingAppointments, recentAppointments]);
  
  const prescriptions: PrescriptionUI[] = React.useMemo(() => {
    // Use dashboard data if available
    if (dashboardData?.medicalRecords) {
      return dashboardData.medicalRecords
        .filter(record => record.prescription)
        .map(record => ({
          id: record.id,
          medication: record.prescription || 'Prescription',
          dosage: '1 tablet',
          frequency: 'Daily',
          startDate: new Date(record.createdAt),
          endDate: new Date(new Date(record.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000),
          status: 'active' as const,
          instructions: record.notes || ''
        }));
    }

    // Fallback to old API
    if (!medicalRecords) return [];
    return medicalRecords
      .filter((record: MedicalRecord) => record.prescriptions)
      .map((record: MedicalRecord) => ({
        id: record.id,
        medication: record.diagnosis || 'Prescription',
        dosage: record.prescriptions?.dosage || '',
        frequency: record.prescriptions?.frequency || '',
        startDate: record.createdAt,
        endDate: record.prescriptions?.endDate || new Date(record.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: record.prescriptions?.status || 'active',
        instructions: record.prescriptions?.instructions || record.notes || ''
      }));
  }, [dashboardData, medicalRecords]);

  const healthRecords: HealthRecordUI[] = React.useMemo(() => {
    // Use dashboard data if available
    if (dashboardData?.medicalRecords) {
      return dashboardData.medicalRecords.map(record => ({
        id: record.id,
        date: new Date(record.createdAt),
        type: (record.diagnosis ? 'consultation' : 'note') as 'consultation' | 'lab_result' | 'prescription' | 'note',
        title: record.diagnosis || 'Medical Record',
        content: record.notes || '',
        attachments: []
      }));
    }

    // Fallback to old API
    if (!medicalRecords) return [];
    return medicalRecords.map((record: MedicalRecord) => ({
      id: record.id,
      date: record.createdAt,
      type: (record.diagnosis ? 'consultation' : 'note') as 'consultation' | 'lab_result' | 'prescription' | 'note',
      title: record.diagnosis || 'Medical Record',
      content: record.notes || '',
      attachments: record.attachments || []
    }));
  }, [dashboardData, medicalRecords]);

  // Use dashboard statistics if available - must be before early returns
  const stats = React.useMemo(() => {
    if (dashboardData?.statistics) {
      return {
        upcomingCount: dashboardData.upcomingAppointments?.length || 0,
        totalAppointments: dashboardData.statistics.totalAppointments,
        completedAppointments: dashboardData.statistics.completedAppointments,
        totalRecords: dashboardData.statistics.totalMedicalRecords,
        activePrescriptions: prescriptions.filter(rx => rx.status === 'active').length,
      };
    }

    // Fallback to computed values
    return {
      upcomingCount: appointments.filter(apt => apt.status === 'scheduled').length,
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => apt.status === 'completed').length,
      totalRecords: healthRecords.length,
      activePrescriptions: prescriptions.filter(rx => rx.status === 'active').length,
    };
  }, [dashboardData, appointments, prescriptions, healthRecords]);

  const upcomingAppointmentsList = appointments.filter(apt => apt.status === 'scheduled');
  const activePrescriptions = prescriptions.filter(rx => rx.status === 'active');

  if (!isAuthenticated) {
    return <Navigate to="/booking" replace />;
  }

  // Loading state - prioritize dashboard data
  const isLoading = isLoadingDashboard || (isLoadingAppointments && !dashboardData) || isLoadingRecords || isLoadingActivity;
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900">
        <div className={`${isMobile ? 'mobile-content p-4' : 'container mx-auto px-4 py-8'}`}>
          <ErrorState
            title="Dashboard Unavailable"
            message="We're having trouble loading your dashboard. Please check your connection and try again."
            onRetry={() => window.location.reload()}
          />
        </div>
        <NetworkStatus />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 ${isMobile ? 'mobile-app-container' : ''}`}>
      <div className={`${isMobile ? 'mobile-content p-4' : 'container mx-auto px-4 py-8'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 dark:text-gray-100`}
              id="dashboard-title"
              aria-label={`Welcome back, ${user?.name || 'Patient'}. Patient Dashboard`}
            >
              Welcome back, {user?.name || 'Patient'}
            </h1>
            <p
              className="text-gray-600 dark:text-gray-400"
              aria-describedby="dashboard-title"
            >
              Your health journey with Dr. Fintan Ekochin
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {!isMobile && 'Settings'}
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
          aria-label="Patient Dashboard Navigation"
        >
          <TabsList
            className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}
            role="tablist"
            aria-label="Dashboard sections"
          >
            <TabsTrigger
              value="overview"
              aria-controls="overview-panel"
              aria-label="Overview - Quick stats and summary"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              aria-controls="appointments-panel"
              aria-label="Appointments - View and manage your appointments"
            >
              Appointments
            </TabsTrigger>
            {!isMobile && (
              <TabsTrigger
                value="prescriptions"
                aria-controls="prescriptions-panel"
                aria-label="Prescriptions - View your active prescriptions"
              >
                Prescriptions
              </TabsTrigger>
            )}
            {!isMobile && (
              <TabsTrigger
                value="records"
                aria-controls="records-panel"
                aria-label="Health Records - View your medical records"
              >
                Health Records
              </TabsTrigger>
            )}
            <TabsTrigger
              value="settings"
              aria-controls="settings-panel"
              aria-label="Settings - Manage your account settings"
            >
              Settings
            </TabsTrigger>
            {isMobile && (
              <TabsTrigger
                value="more"
                aria-controls="more-panel"
                aria-label="More options - Additional features"
              >
                More
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent
            value="overview"
            className="space-y-6"
            id="overview-panel"
            role="tabpanel"
            aria-labelledby="overview-tab"
          >
            {/* Quick Stats */}
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.upcomingCount}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Upcoming
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <Pill className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.activePrescriptions}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Active Rx
                  </div>
                </CardContent>
              </Card>

              {!isMobile && (
                <>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {stats.totalRecords}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Records
                      </div>
                    </CardContent>
                  </Card>

                </>
              )}
            </div>

            {/* Next Appointment */}
            {(dashboardData?.nextAppointment || upcomingAppointmentsList.length > 0) && (
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
                        {dashboardData?.nextAppointment
                          ? format(new Date(dashboardData.nextAppointment.date), 'EEEE, MMMM d')
                          : format(upcomingAppointmentsList[0].date, 'EEEE, MMMM d')
                        }
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {dashboardData?.nextAppointment
                          ? `${format(new Date(dashboardData.nextAppointment.date), 'h:mm a')} • ${dashboardData.nextAppointment.provider}`
                          : `${upcomingAppointmentsList[0].time} • ${upcomingAppointmentsList[0].doctor}`
                        }
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        {(dashboardData?.nextAppointment?.consultationType || upcomingAppointmentsList[0]?.type) === 'VIDEO' ||
                         (dashboardData?.nextAppointment?.consultationType || upcomingAppointmentsList[0]?.type) === 'video' ? (
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

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
                  <Link to="/booking">
                    <Button variant="outline" className="w-full h-20 flex-col gap-2">
                      <Calendar className="h-6 w-6" />
                      Book Appointment
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <MessageSquare className="h-6 w-6" />
                    Send Message
                  </Button>
                  
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Download className="h-6 w-6" />
                    Download Records
                  </Button>
                  
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Bell className="h-6 w-6" />
                    Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Dashboard Components */}
            <div className="w-full">
              {/* Activity Feed */}
              <ActivityFeed
                activities={activities}
                isLoading={isLoadingActivity}
                maxItems={8}
              />
            </div>

            {/* Enhanced Upcoming Appointments */}
            <UpcomingAppointments
              appointments={appointments.map(apt => ({
                id: apt.id,
                appointmentDate: apt.date,
                reason: apt.reason || 'General consultation',
                consultationType: apt.type === 'video' ? 'VIDEO' : 'AUDIO',
                status: apt.status === 'scheduled' ? 'SCHEDULED' :
                       apt.status === 'completed' ? 'COMPLETED' : 'CANCELLED',
                provider: {
                  id: 'provider-1',
                  name: apt.doctor,
                  specialization: 'General Medicine'
                },
                notes: apt.notes,
                duration: 30,
                canJoin: apt.status === 'scheduled',
                canReschedule: apt.status === 'scheduled',
                canCancel: apt.status === 'scheduled'
              }))}
              maxItems={3}
            />
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Appointments</h2>
              <Link to="/booking">
                <Button>
                  <Calendar className="h-4 w-4 mr-2" />
                  Book New
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${
                          appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-600' :
                          appointment.status === 'completed' ? 'bg-green-100 text-green-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {appointment.type === 'video' ? <Video className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                        </div>
                        
                        <div>
                          <div className="font-semibold">
                            {format(appointment.date, 'MMMM d, yyyy')} at {appointment.time}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            {appointment.doctor}
                          </div>
                          {appointment.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                              {appointment.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          appointment.status === 'scheduled' ? 'default' :
                          appointment.status === 'completed' ? 'secondary' :
                          'destructive'
                        }>
                          {appointment.status}
                        </Badge>
                        
                        {appointment.status === 'scheduled' && (
                          <Button size="sm">
                            Join
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Mobile More Tab */}
          {isMobile && (
            <TabsContent value="more" className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('prescriptions')}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-semibold">Prescriptions</div>
                        <div className="text-sm text-gray-600">{activePrescriptions.length} active medications</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('records')}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-purple-600" />
                      <div>
                        <div className="font-semibold">Health Records</div>
                        <div className="text-sm text-gray-600">{healthRecords.length} documents</div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions" className="space-y-6">
            <h2 className="text-2xl font-bold">Your Prescriptions</h2>
            
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <Card key={prescription.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-full">
                          <Pill className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-semibold text-lg">{prescription.medication}</div>
                          <div className="text-gray-600 dark:text-gray-400 mb-2">
                            {prescription.dosage} • {prescription.frequency}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-500">
                            {prescription.instructions}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                            {format(prescription.startDate, 'MMM d')} - {format(prescription.endDate, 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      
                      <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                        {prescription.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Health Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Health Records</h2>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
            
            <div className="space-y-4">
              {healthRecords.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${
                        record.type === 'consultation' ? 'bg-blue-100 text-blue-600' :
                        record.type === 'lab_result' ? 'bg-purple-100 text-purple-600' :
                        record.type === 'prescription' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {record.type === 'consultation' ? <User className="h-5 w-5" /> :
                         record.type === 'lab_result' ? <Activity className="h-5 w-5" /> :
                         record.type === 'prescription' ? <Pill className="h-5 w-5" /> :
                         <FileText className="h-5 w-5" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold">{record.title}</div>
                          <div className="text-sm text-gray-500">
                            {format(record.date, 'MMM d, yyyy')}
                          </div>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          {record.content}
                        </div>
                        {record.attachments && record.attachments.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {record.attachments.map((attachment, index) => (
                              <Button key={index} variant="outline" size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                {attachment}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <React.Suspense fallback={<InlineLoader message="Loading settings..." />}>
              <PatientSettings />
            </React.Suspense>
          </TabsContent>
        </Tabs>
      </div>
      <NetworkStatus />
    </div>
  );
};



export default PatientDashboard;
