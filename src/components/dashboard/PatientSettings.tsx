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
  Phone,
  Mail,
  MapPin,
  Camera,
  Save,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const PatientSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [notifications, setNotifications] = useState({
    emailAppointments: true,
    smsAppointments: true,
    emailReminders: true,
    smsReminders: false,
    emailResults: true,
    smsResults: false,
    marketingEmails: false
  });

  const [privacy, setPrivacy] = useState({
    shareDataWithProviders: true,
    allowResearchParticipation: false,
    showProfileToOtherPatients: false
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
        description: "Your profile has been successfully updated.",
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

  const handleNotificationsSave = async () => {
    setIsLoading(true);
    try {
      // API call to update notifications
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast({
        title: "Notifications Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notifications. Please try again.",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>
        <Badge variant="outline">Patient Account</Badge>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback className="text-lg">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
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
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your full address"
                />
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h4 className="font-medium">Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency-name">Name</Label>
                    <Input
                      id="emergency-name"
                      value={profile.emergencyContact.name}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency-phone">Phone</Label>
                    <Input
                      id="emergency-phone"
                      value={profile.emergencyContact.phone}
                      onChange={(e) => setProfile(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency-relationship">Relationship</Label>
                    <Select
                      value={profile.emergencyContact.relationship}
                      onValueChange={(value) => setProfile(prev => ({
                        ...prev,
                        emergencyContact: { ...prev.emergencyContact, relationship: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="child">Child</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button onClick={handleProfileSave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
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
                <h4 className="font-medium">Appointment Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-appointments">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive appointment confirmations via email</p>
                    </div>
                    <Switch
                      id="email-appointments"
                      checked={notifications.emailAppointments}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailAppointments: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-appointments">SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive appointment confirmations via SMS</p>
                    </div>
                    <Switch
                      id="sms-appointments"
                      checked={notifications.smsAppointments}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsAppointments: checked }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Reminder Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-reminders">Email Reminders</Label>
                      <p className="text-sm text-gray-500">Receive appointment reminders via email</p>
                    </div>
                    <Switch
                      id="email-reminders"
                      checked={notifications.emailReminders}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailReminders: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-reminders">SMS Reminders</Label>
                      <p className="text-sm text-gray-500">Receive appointment reminders via SMS</p>
                    </div>
                    <Switch
                      id="sms-reminders"
                      checked={notifications.smsReminders}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsReminders: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleNotificationsSave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="share-data">Share Data with Healthcare Providers</Label>
                    <p className="text-sm text-gray-500">Allow your healthcare providers to access your medical history</p>
                  </div>
                  <Switch
                    id="share-data"
                    checked={privacy.shareDataWithProviders}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, shareDataWithProviders: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="research">Research Participation</Label>
                    <p className="text-sm text-gray-500">Allow anonymized data to be used for medical research</p>
                  </div>
                  <Switch
                    id="research"
                    checked={privacy.allowResearchParticipation}
                    onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowResearchParticipation: checked }))}
                  />
                </div>
              </div>

              <Button onClick={handleNotificationsSave} disabled={isLoading} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Privacy Settings'}
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
      </Tabs>
    </div>
  );
};

export default PatientSettings;
