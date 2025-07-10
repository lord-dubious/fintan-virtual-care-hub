import React from "react";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Bell,
  Shield,
  Calendar,
  Clock,
  Stethoscope,
  GraduationCap,
  Award,
  Camera,
  Save,
  Eye,
  EyeOff,
  DollarSign
} from 'lucide-react';

const DoctorSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialization: '',
    licenseNumber: '',
    yearsOfExperience: '',
    education: '',
    bio: '',
    consultationFee: '',
    languages: [] as string[]
  });

  const [availability, setAvailability] = useState({
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' }
  });

  const [notifications, setNotifications] = useState({
    newAppointments: true,
    appointmentReminders: true,
    patientMessages: true,
    systemUpdates: false,
    marketingEmails: false
  });

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      // API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: "Profile Updated",
        description: "Your professional profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvailabilitySave = async () => {
    setIsLoading(true);
    try {
      // API call to update availability
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: "Availability Updated",
        description: "Your availability schedule has been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (password.new !== password.confirm) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // API call to change password
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      setPassword({ current: '', new: '', confirm: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
        <Badge variant="outline">Doctor Account</Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Professional Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'D'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">Professional headshot recommended</p>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select
                    value={profile.specialization}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, specialization: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Medicine</SelectItem>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="psychiatry">Psychiatry</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                      <SelectItem value="neurology">Neurology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License Number</Label>
                  <Input
                    id="license"
                    value={profile.licenseNumber}
                    onChange={(e) => setProfile(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={profile.yearsOfExperience}
                    onChange={(e) => setProfile(prev => ({ ...prev, yearsOfExperience: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Textarea
                  id="education"
                  value={profile.education}
                  onChange={(e) => setProfile(prev => ({ ...prev, education: e.target.value }))}
                  placeholder="Medical school, residency, fellowships..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Brief description of your practice and approach to patient care..."
                  rows={4}
                />
              </div>

              <Button onClick={handleProfileSave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Weekly Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {dayNames.map((day, index) => (
                  <div key={day} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={availability[day as keyof typeof availability].enabled}
                        onCheckedChange={(checked) => setAvailability(prev => ({
                          ...prev,
                          [day]: { ...prev[day as keyof typeof prev], enabled: checked }
                        }))}
                      />
                      <Label className="font-medium">{dayLabels[index]}</Label>
                    </div>
                    {availability[day as keyof typeof availability].enabled && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={availability[day as keyof typeof availability].start}
                          onChange={(e) => setAvailability(prev => ({
                            ...prev,
                            [day]: { ...prev[day as keyof typeof prev], start: e.target.value }
                          }))}
                          className="w-32"
                        />
                        <span className="text-gray-500">to</span>
                        <Input
                          type="time"
                          value={availability[day as keyof typeof availability].end}
                          onChange={(e) => setAvailability(prev => ({
                            ...prev,
                            [day]: { ...prev[day as keyof typeof prev], end: e.target.value }
                          }))}
                          className="w-32"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={handleAvailabilitySave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Availability'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="new-appointments">New Appointments</Label>
                    <p className="text-sm text-gray-500">Get notified when patients book appointments</p>
                  </div>
                  <Switch
                    id="new-appointments"
                    checked={notifications.newAppointments}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newAppointments: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
                    <p className="text-sm text-gray-500">Receive reminders before scheduled appointments</p>
                  </div>
                  <Switch
                    id="appointment-reminders"
                    checked={notifications.appointmentReminders}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, appointmentReminders: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="patient-messages">Patient Messages</Label>
                    <p className="text-sm text-gray-500">Get notified when patients send messages</p>
                  </div>
                  <Switch
                    id="patient-messages"
                    checked={notifications.patientMessages}
                    onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, patientMessages: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleAvailabilitySave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Change Password</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        value={password.current}
                        onChange={(e) => setPassword(prev => ({ ...prev, current: e.target.value }))}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={password.new}
                      onChange={(e) => setPassword(prev => ({ ...prev, new: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={password.confirm}
                      onChange={(e) => setPassword(prev => ({ ...prev, confirm: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handlePasswordChange} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Billing & Fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="consultation-fee">Consultation Fee (USD)</Label>
                  <Input
                    id="consultation-fee"
                    type="number"
                    value={profile.consultationFee}
                    onChange={(e) => setProfile(prev => ({ ...prev, consultationFee: e.target.value }))}
                    placeholder="150"
                  />
                  <p className="text-sm text-gray-500">Your standard consultation fee per session</p>
                </div>
              </div>

              <Button onClick={handleProfileSave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Billing Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorSettings;
