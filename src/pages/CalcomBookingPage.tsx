import React from "react";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Video, Mic } from 'lucide-react';
import CalcomBooking from '@/components/booking/CalcomBooking';
import { useAuth } from '@/lib/auth/authProvider';

const CalcomBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleBookingComplete = () => {
    navigate('/patient/appointments');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Please log in to book an appointment.
            </p>
            <Button 
              onClick={() => navigate('/auth/login')}
              className="w-full"
            >
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Book Appointment
                </h1>
                <p className="text-sm text-gray-600">
                  Schedule your consultation with Dr. Fintan Ekochin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Video className="h-3 w-3" />
                Video Calls
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Mic className="h-3 w-3" />
                Audio Calls
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dr. Fintan Ekochin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Specialties</h4>
                  <p className="text-sm text-gray-600">
                    General Medicine, Telemedicine, Preventive Care
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Languages</h4>
                  <p className="text-sm text-gray-600">English</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Available</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-3 w-3 text-blue-500" />
                      <span>Video Consultations</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mic className="h-3 w-3 text-green-500" />
                      <span>Audio Consultations</span>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-medium text-gray-900 mb-2">Consultation Types</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>General Consultation</span>
                      <span>30 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Follow-up</span>
                      <span>15 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Emergency</span>
                      <span>45 min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Component */}
          <div className="lg:col-span-3">
            <CalcomBooking 
              onBookingComplete={handleBookingComplete}
              defaultConsultationType="VIDEO"
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Easy Scheduling</h4>
                <p>Book appointments that fit your schedule with real-time availability.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Video className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Video & Audio Calls</h4>
                <p>Choose between high-quality video or audio-only consultations.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">Flexible Duration</h4>
                <p>Consultation lengths tailored to your needs, from 15 to 45 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalcomBookingPage;
