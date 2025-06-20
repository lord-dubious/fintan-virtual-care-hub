
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
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
  Heart,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  date: Date;
  time: string;
  type: 'video' | 'audio';
  status: 'scheduled' | 'completed' | 'cancelled';
  doctor: string;
  notes?: string;
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'discontinued';
  instructions: string;
}

interface HealthRecord {
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load mock data
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        date: new Date(2024, 5, 15),
        time: '10:00 AM',
        type: 'video',
        status: 'scheduled',
        doctor: 'Dr. Fintan Ekochin',
        notes: 'Follow-up consultation for ongoing treatment'
      },
      {
        id: '2',
        date: new Date(2024, 5, 8),
        time: '2:00 PM',
        type: 'audio',
        status: 'completed',
        doctor: 'Dr. Fintan Ekochin',
        notes: 'Initial consultation completed successfully'
      }
    ];

    const mockPrescriptions: Prescription[] = [
      {
        id: '1',
        medication: 'Omega-3 Fish Oil',
        dosage: '1000mg',
        frequency: 'Twice daily',
        startDate: new Date(2024, 4, 1),
        endDate: new Date(2024, 7, 1),
        status: 'active',
        instructions: 'Take with meals to improve absorption'
      },
      {
        id: '2',
        medication: 'Vitamin D3',
        dosage: '2000 IU',
        frequency: 'Once daily',
        startDate: new Date(2024, 4, 1),
        endDate: new Date(2024, 10, 1),
        status: 'active',
        instructions: 'Take in the morning with breakfast'
      }
    ];

    const mockHealthRecords: HealthRecord[] = [
      {
        id: '1',
        date: new Date(2024, 5, 8),
        type: 'consultation',
        title: 'Initial Consultation',
        content: 'Comprehensive health assessment completed. Discussed lifestyle factors and natural treatment options.',
      },
      {
        id: '2',
        date: new Date(2024, 5, 1),
        type: 'lab_result',
        title: 'Blood Work Results',
        content: 'Vitamin D levels: 25 ng/ml (slightly low). B12 levels: Normal. Recommended supplementation.',
      }
    ];

    setAppointments(mockAppointments);
    setPrescriptions(mockPrescriptions);
    setHealthRecords(mockHealthRecords);
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/booking" replace />;
  }

  const upcomingAppointments = appointments.filter(apt => apt.status === 'scheduled');
  const activePrescriptions = prescriptions.filter(rx => rx.status === 'active');

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900 ${isMobile ? 'mobile-app-container' : ''}`}>
      <div className={`${isMobile ? 'mobile-content p-4' : 'container mx-auto px-4 py-8'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 dark:text-gray-100`}>
              Welcome back, {user?.name || 'Patient'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your health journey with Dr. Fintan Ekochin
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {!isMobile && 'Settings'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            {!isMobile && <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>}
            {!isMobile && <TabsTrigger value="records">Health Records</TabsTrigger>}
            {isMobile && <TabsTrigger value="more">More</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {upcomingAppointments.length}
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
                    {activePrescriptions.length}
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
                        {healthRecords.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Records
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        95%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Health Score
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Next Appointment */}
            {upcomingAppointments.length > 0 && (
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
                        {format(upcomingAppointments[0].date, 'EEEE, MMMM d')}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {upcomingAppointments[0].time} • {upcomingAppointments[0].doctor}
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        {upcomingAppointments[0].type === 'video' ? (
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
        </Tabs>
      </div>
    </div>
  );
};

export default PatientDashboard;
