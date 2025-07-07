
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminSettings = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Profile settings
  const [profileForm, setProfileForm] = useState({
    name: 'Dr. Fintan Smith',
    email: 'dr.fintan@example.com',
    phone: '(555) 987-6543',
    bio: 'Board-certified physician with over 15 years of experience in telemedicine and primary care.'
  });

  // Availability settings
  const [availableDays, setAvailableDays] = useState<Date[]>([
    new Date(2025, 4, 12),
    new Date(2025, 4, 13),
    new Date(2025, 4, 14),
    new Date(2025, 4, 15),
    new Date(2025, 4, 16)
  ]);

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    emailReminders: true,
    emailCancellations: true,
    browserNotifications: false,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully."
    });
  };

  const handleSaveAvailability = () => {
    toast({
      title: "Availability Updated",
      description: "Your availability settings have been saved successfully."
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Preferences Updated",
      description: "Your notification preferences have been saved successfully."
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className={isMobile ? "grid w-full grid-cols-3" : ""}>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your public profile information displayed to patients.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={profileForm.name} 
                  onChange={handleProfileChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={profileForm.email} 
                  onChange={handleProfileChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  value={profileForm.phone} 
                  onChange={handleProfileChange} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio" 
                  value={profileForm.bio} 
                  onChange={handleProfileChange} 
                  rows={4}
                />
              </div>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Availability Settings</CardTitle>
              <CardDescription>
                Set your working days and hours for patient appointments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Select Available Days</Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="multiple"
                    selected={availableDays}
                    onSelect={setAvailableDays as (dates: Date[] | undefined) => void}
                    className="rounded-md border"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Default Working Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Start Time</Label>
                        <Input 
                          type="time" 
                          defaultValue="09:00" 
                          className="w-32" 
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <Label>End Time</Label>
                        <Input 
                          type="time" 
                          defaultValue="17:00" 
                          className="w-32" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Break/Lunch Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Start Time</Label>
                        <Input 
                          type="time" 
                          defaultValue="12:00" 
                          className="w-32" 
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <Label>End Time</Label>
                        <Input 
                          type="time" 
                          defaultValue="13:00" 
                          className="w-32" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Button onClick={handleSaveAvailability} className="mt-4">Save Availability</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to be notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <Label>New Appointment Bookings</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive an email when a patient books an appointment
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.emailAppointments} 
                      onCheckedChange={() => handleNotificationChange('emailAppointments')} 
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <Label>Appointment Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive reminders for upcoming appointments
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.emailReminders} 
                      onCheckedChange={() => handleNotificationChange('emailReminders')} 
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <Label>Cancellations</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for cancelled appointments
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.emailCancellations} 
                      onCheckedChange={() => handleNotificationChange('emailCancellations')} 
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Browser Notifications</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <Label>Enable Browser Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications in your browser when the app is open
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.browserNotifications} 
                      onCheckedChange={() => handleNotificationChange('browserNotifications')} 
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
