
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Home: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Virtual Care Hub</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Connect with healthcare providers through secure video and audio consultations from the comfort of your home.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/auth/register">Get Started</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Book Appointments</CardTitle>
            <CardDescription>
              Schedule consultations with qualified healthcare providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Easy online booking system with real-time availability
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Video Consultations</CardTitle>
            <CardDescription>
              High-quality video calls with healthcare professionals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Secure, encrypted video consultations from anywhere
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Records</CardTitle>
            <CardDescription>
              Access your medical history and consultation notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Secure storage and easy access to your health data
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
