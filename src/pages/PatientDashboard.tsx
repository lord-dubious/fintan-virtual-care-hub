
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, Pill, MessageSquare, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useIsMobile } from '@/hooks/use-mobile';

const PatientDashboard = () => {
  const isMobile = useIsMobile();

  // Mock data - replace with real data
  const upcomingAppointments = [
    {
      id: 1,
      date: '2024-01-15',
      time: '10:00 AM',
      type: 'Video Consultation',
      status: 'confirmed'
    }
  ];

  const prescriptions = [
    {
      id: 1,
      medication: 'Medication Name',
      dosage: '500mg',
      frequency: 'Twice daily',
      prescribedDate: '2024-01-10'
    }
  ];

  const consultationHistory = [
    {
      id: 1,
      date: '2024-01-10',
      type: 'Video Consultation',
      diagnosis: 'Follow-up consultation',
      notes: 'Patient doing well, continue current treatment'
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isMobile ? 'mobile-app-container' : ''}`}>
      <Navbar />
      <main className={`flex-grow ${isMobile ? 'mobile-content' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 dark:text-medical-dark-text-primary">
              Patient Dashboard
            </h1>

            <Tabs defaultValue="appointments" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="appointments" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Appointments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {upcomingAppointments.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingAppointments.map((appointment) => (
                            <div key={appointment.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">{appointment.type}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.date} at {appointment.time}
                                  </p>
                                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                    {appointment.status}
                                  </span>
                                </div>
                                <Button size="sm">Join Call</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No upcoming appointments</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link to="/booking">
                        <Button className="w-full">Book New Appointment</Button>
                      </Link>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Message Dr. Fintan
                      </Button>
                      <Button variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Request Medical Records
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="prescriptions">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Current Prescriptions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {prescriptions.length > 0 ? (
                      <div className="space-y-4">
                        {prescriptions.map((prescription) => (
                          <div key={prescription.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{prescription.medication}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {prescription.dosage} - {prescription.frequency}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Prescribed: {prescription.prescribedDate}
                                </p>
                              </div>
                              <Button size="sm" variant="outline">Refill Request</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No current prescriptions</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Consultation History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {consultationHistory.length > 0 ? (
                      <div className="space-y-4">
                        {consultationHistory.map((consultation) => (
                          <div key={consultation.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{consultation.type}</h3>
                                <p className="text-sm text-muted-foreground">{consultation.date}</p>
                                <p className="text-sm mt-2"><strong>Diagnosis:</strong> {consultation.diagnosis}</p>
                                <p className="text-sm mt-1"><strong>Notes:</strong> {consultation.notes}</p>
                              </div>
                              <Button size="sm" variant="outline">View Details</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No consultation history</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Full Name</label>
                          <p className="mt-1 p-2 border rounded">John Doe</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <p className="mt-1 p-2 border rounded">john@example.com</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Phone</label>
                          <p className="mt-1 p-2 border rounded">+1 234 567 8900</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Date of Birth</label>
                          <p className="mt-1 p-2 border rounded">01/01/1990</p>
                        </div>
                      </div>
                      <Button className="mt-4">Edit Profile</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      {!isMobile && <Footer />}
    </div>
  );
};

export default PatientDashboard;
