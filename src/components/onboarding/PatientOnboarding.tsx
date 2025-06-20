import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Calendar, User, Phone, MapPin, Heart, FileText, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PatientOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
}

export const PatientOnboarding: React.FC<PatientOnboardingProps> = ({
  isOpen,
  onClose,
  userEmail,
  userName
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Information
    dateOfBirth: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    
    // Medical Information
    primaryConcern: '',
    currentMedications: '',
    allergies: '',
    medicalHistory: '',
    previousSurgeries: '',
    familyHistory: '',
    
    // Lifestyle Information
    occupation: '',
    exerciseFrequency: '',
    smokingStatus: '',
    alcoholConsumption: '',
    sleepHours: '',
    stressLevel: '',
    
    // Preferences
    preferredAppointmentTime: '',
    communicationPreference: '',
    languagePreference: 'English',
    
    // Consent
    termsAccepted: false,
    privacyAccepted: false,
    marketingConsent: false
  });

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!formData.termsAccepted || !formData.privacyAccepted) {
      toast({
        title: "Consent Required",
        description: "Please accept the terms and privacy policy to continue",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call to save patient data
    setTimeout(() => {
      toast({
        title: "Profile Complete!",
        description: "Your patient profile has been created successfully",
      });
      setIsSubmitting(false);
      onClose();
    }, 2000);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-medical-primary dark:text-medical-accent mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-medical-neutral-800 dark:text-medical-dark-text-primary">
                Personal Information
              </h3>
              <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                Let's start with your basic information
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="123 Main Street"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="h-10"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="12345"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            
            <div className="border-t pt-4 mt-6">
              <h4 className="font-medium text-medical-neutral-800 dark:text-medical-dark-text-primary mb-3">
                Emergency Contact
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    placeholder="Full Name"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Heart className="h-12 w-12 text-medical-primary dark:text-medical-accent mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-medical-neutral-800 dark:text-medical-dark-text-primary">
                Medical History
              </h3>
              <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                Help us understand your health background
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryConcern">Primary Health Concern</Label>
                <Textarea
                  id="primaryConcern"
                  placeholder="What brings you to Dr. Fintan today?"
                  value={formData.primaryConcern}
                  onChange={(e) => handleInputChange('primaryConcern', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentMedications">Current Medications</Label>
                <Textarea
                  id="currentMedications"
                  placeholder="List any medications you're currently taking (include dosage if known)"
                  value={formData.currentMedications}
                  onChange={(e) => handleInputChange('currentMedications', e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Input
                  id="allergies"
                  placeholder="Food, drug, or environmental allergies"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange('allergies', e.target.value)}
                  className="h-10"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="medicalHistory">Past Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  placeholder="Previous diagnoses, chronic conditions, hospitalizations"
                  value={formData.medicalHistory}
                  onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="familyHistory">Family Medical History</Label>
                <Textarea
                  id="familyHistory"
                  placeholder="Significant family medical history (diabetes, heart disease, cancer, etc.)"
                  value={formData.familyHistory}
                  onChange={(e) => handleInputChange('familyHistory', e.target.value)}
                  className="min-h-[60px]"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-medical-primary dark:text-medical-accent mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-medical-neutral-800 dark:text-medical-dark-text-primary">
                Lifestyle Information
              </h3>
              <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                Your lifestyle helps us provide better care
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Input
                  id="occupation"
                  placeholder="Your job/profession"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exerciseFrequency">Exercise Frequency</Label>
                <Select value={formData.exerciseFrequency} onValueChange={(value) => handleInputChange('exerciseFrequency', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="1-2-times">1-2 times per week</SelectItem>
                    <SelectItem value="3-4-times">3-4 times per week</SelectItem>
                    <SelectItem value="5-plus-times">5+ times per week</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smokingStatus">Smoking Status</Label>
                <Select value={formData.smokingStatus} onValueChange={(value) => handleInputChange('smokingStatus', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never smoked</SelectItem>
                    <SelectItem value="former">Former smoker</SelectItem>
                    <SelectItem value="current">Current smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="alcoholConsumption">Alcohol Consumption</Label>
                <Select value={formData.alcoholConsumption} onValueChange={(value) => handleInputChange('alcoholConsumption', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="occasional">Occasional</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sleepHours">Sleep Hours (per night)</Label>
                <Select value={formData.sleepHours} onValueChange={(value) => handleInputChange('sleepHours', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-than-5">Less than 5</SelectItem>
                    <SelectItem value="5-6">5-6 hours</SelectItem>
                    <SelectItem value="7-8">7-8 hours</SelectItem>
                    <SelectItem value="9-plus">9+ hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stressLevel">Stress Level</Label>
                <Select value={formData.stressLevel} onValueChange={(value) => handleInputChange('stressLevel', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="very-high">Very High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-medical-primary dark:text-medical-accent mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-medical-neutral-800 dark:text-medical-dark-text-primary">
                Preferences
              </h3>
              <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                Help us customize your experience
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredAppointmentTime">Preferred Appointment Time</Label>
                <Select value={formData.preferredAppointmentTime} onValueChange={(value) => handleInputChange('preferredAppointmentTime', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                    <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="communicationPreference">Communication Preference</Label>
                <Select value={formData.communicationPreference} onValueChange={(value) => handleInputChange('communicationPreference', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS/Text</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="app">App Notifications</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="languagePreference">Language Preference</Label>
                <Select value={formData.languagePreference} onValueChange={(value) => handleInputChange('languagePreference', value)}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Igbo">Igbo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-medical-primary dark:text-medical-accent mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-medical-neutral-800 dark:text-medical-dark-text-primary">
                Terms & Consent
              </h3>
              <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                Please review and accept our terms
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="termsAccepted"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange('termsAccepted', checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="termsAccepted" className="text-sm font-medium cursor-pointer">
                    I accept the Terms of Service and Privacy Policy
                  </Label>
                  <p className="text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">
                    Required to use Dr. Fintan's virtual care services
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacyAccepted"
                  checked={formData.privacyAccepted}
                  onCheckedChange={(checked) => handleInputChange('privacyAccepted', checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="privacyAccepted" className="text-sm font-medium cursor-pointer">
                    I consent to the collection and use of my health information
                  </Label>
                  <p className="text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">
                    Required for providing medical care and maintaining health records
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketingConsent"
                  checked={formData.marketingConsent}
                  onCheckedChange={(checked) => handleInputChange('marketingConsent', checked as boolean)}
                />
                <div className="space-y-1">
                  <Label htmlFor="marketingConsent" className="text-sm font-medium cursor-pointer">
                    I would like to receive health tips and updates
                  </Label>
                  <p className="text-xs text-medical-neutral-500 dark:text-medical-dark-text-secondary">
                    Optional - You can unsubscribe at any time
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-medical-bg-light dark:bg-medical-dark-surface/30 p-4 rounded-lg mt-6">
              <h4 className="font-medium text-medical-neutral-800 dark:text-medical-dark-text-primary mb-2">
                Profile Summary
              </h4>
              <div className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary space-y-1">
                <p><strong>Name:</strong> {userName}</p>
                <p><strong>Email:</strong> {userEmail}</p>
                <p><strong>Phone:</strong> {formData.phone || 'Not provided'}</p>
                <p><strong>Primary Concern:</strong> {formData.primaryConcern || 'Not specified'}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-white dark:bg-medical-dark-surface border-medical-border-light dark:border-medical-dark-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-medical-primary dark:text-medical-accent">
            Complete Your Patient Profile
          </DialogTitle>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {renderStep()}
        </div>
        
        <div className="flex justify-between pt-4 border-t border-medical-border-light dark:border-medical-dark-border">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 flex items-center gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting || !formData.termsAccepted || !formData.privacyAccepted}
              className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90 flex items-center gap-2"
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Profile'}
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
