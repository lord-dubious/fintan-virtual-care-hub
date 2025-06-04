import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Twitter, Key } from 'lucide-react';

interface OnboardingFlowProps {
  currentStep: number;
  onComplete: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ currentStep, onComplete }) => {
  const { toast } = useToast();
  const [step, setStep] = useState(currentStep);

  const steps = [
    {
      title: "Welcome to Dr. Fintan's Virtual Care Hub",
      content: (
        <div className="text-center">
          <p className="text-lg text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-6">
            Let's get you set up for your virtual healthcare journey.
          </p>
          <Button 
            onClick={() => setStep(1)}
            className="bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90"
          >
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    {
      title: "Complete Your Profile",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="Enter your full name" />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" placeholder="Enter your phone number" />
          </div>
          <Button 
            onClick={() => setStep(2)}
            className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90"
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    },
    {
      title: "Connect Your Accounts",
      content: (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              toast({
                title: "Twitter Integration",
                description: "Twitter integration coming soon!"
              });
            }}
          >
            <Twitter className="mr-2 h-4 w-4" />
            Connect Twitter
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              toast({
                title: "API Key Setup",
                description: "API key setup coming soon!"
              });
            }}
          >
            <Key className="mr-2 h-4 w-4" />
            Add API Keys
          </Button>
          <Button 
            onClick={onComplete}
            className="w-full bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90"
          >
            Complete Setup <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-medical-bg-light dark:bg-medical-dark-bg p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{steps[step].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {steps[step].content}
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;