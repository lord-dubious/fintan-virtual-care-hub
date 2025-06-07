
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Pill, 
  LogOut, 
  User,
  Phone,
  Video,
  Download
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Mock data - in real app, this would come from API
  const appointments = [
    {
      id: 1,
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'video',
      status: 'upcoming',
      reason: 'General consultation'
    },
    {
      id: 2,
      date: '2024-01-08',
      time: '2:00 PM',
      type: 'audio',
      status: 'completed',
      reason: 'Follow-up'
    }
  ];

  const prescriptions = [
    {
      id: 1,
      date: '2024-01-08',
      medication: 'Multivitamin Complex',
      dosage: 'Once daily with food',
      duration: '30 days',
      notes: 'Natural vitamin supplement for energy support'
    }
  ];

  const consultationNotes = [
    {
      id: 1,
      date: '2024-01-08',
      type: 'Follow-up',
      summary: 'Patient showing improvement with lifestyle changes. Continue current nutrition plan.',
      recommendations: 'Increase water intake, continue meditation practice'
    }
  ];

  if (!user) {
    navigate('/booking');
    return null;
  }

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      
      <main className={`flex-grow ${isMobile ? 'mobile-content px-4' : ''} bg-medical-bg-light dark:bg-medical-dark-bg`}>
        <div className={`${isMobile ? 'py-4' : 'container mx-auto px-4 py-8'}`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold dark:text-medical-dark-text-primary">
                Welcome back, {user.name.split(' ')[0]}!
              </h1>
              <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                Manage your consultations and health records
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="dark:bg-transparent dark:text-medical-dark-text-primary"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/booking')}>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-medical-primary dark:text-medical-accent mx-auto mb-2" />
                <h3 className="font-semibold dark:text-medical-dark-text-primary">Book New Consultation</h3>
                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">Schedule your next appointment</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <FileText className="h-8 w-8 text-medical-primary dark:text-medical-accent mx-auto mb-2" />
                <h3 className="font-semibold dark:text-medical-dark-text-primary">Medical Records</h3>
                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">View your health history</p>
              </CardContent>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-4 text-center">
                <User className="h-8 w-8 text-medical-primary dark:text-medical-accent mx-auto mb-2" />
                <h3 className="font-semibold dark:text-medical-dark-text-primary">Profile Settings</h3>
                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">Update your information</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appointments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-medical-dark-text-primary">Your Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border border-medical-border-light dark:border-medical-dark-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {appointment.type === 'video' ? (
                            <Video className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
                          ) : (
                            <Phone className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
                          )}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium dark:text-medical-dark-text-primary">{appointment.date}</span>
                              <span className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">{appointment.time}</span>
                              <Badge variant={appointment.status === 'upcoming' ? 'default' : 'secondary'}>
                                {appointment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">{appointment.reason}</p>
                          </div>
                        </div>
                        {appointment.status === 'upcoming' && (
                          <Button size="sm" onClick={() => navigate('/consultation')}>
                            Join Call
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prescriptions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-medical-dark-text-primary">Prescriptions & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptions.map((prescription) => (
                      <div key={prescription.id} className="p-4 border border-medical-border-light dark:border-medical-dark-border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Pill className="h-5 w-5 text-medical-primary dark:text-medical-accent mt-1" />
                            <div>
                              <h3 className="font-medium dark:text-medical-dark-text-primary">{prescription.medication}</h3>
                              <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">{prescription.dosage}</p>
                              <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">Duration: {prescription.duration}</p>
                              <p className="text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary mt-2">{prescription.notes}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">{prescription.date}</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-medical-dark-text-primary">Consultation Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {consultationNotes.map((note) => (
                      <div key={note.id} className="p-4 border border-medical-border-light dark:border-medical-dark-border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-5 w-5 text-medical-primary dark:text-medical-accent" />
                            <span className="font-medium dark:text-medical-dark-text-primary">{note.type}</span>
                            <Badge variant="outline">{note.date}</Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <h4 className="text-sm font-medium text-medical-neutral-600 dark:text-medical-dark-text-primary">Summary:</h4>
                            <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">{note.summary}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-medical-neutral-600 dark:text-medical-dark-text-primary">Recommendations:</h4>
                            <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">{note.recommendations}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="dark:text-medical-dark-text-primary">Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-medical-neutral-600 dark:text-medical-dark-text-primary">Name</label>
                        <p className="mt-1 text-medical-neutral-600 dark:text-medical-dark-text-secondary">{user.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-medical-neutral-600 dark:text-medical-dark-text-primary">Email</label>
                        <p className="mt-1 text-medical-neutral-600 dark:text-medical-dark-text-secondary">{user.email}</p>
                      </div>
                    </div>
                    <Button className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      {!isMobile && <Footer />}
    </div>
  );
};

export default PatientDashboard;
