
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Video, Phone, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ConsultationTypeStepProps {
  bookingData: {
    consultationType: string;
  };
  updateBookingData: (data: { consultationType: string }) => void;
}

const ConsultationTypeStep: React.FC<ConsultationTypeStepProps> = ({ bookingData, updateBookingData }) => {
  const consultationTypes = [
    {
      id: 'video',
      title: 'Video Consultation',
      price: '$85',
      duration: '30 minutes',
      icon: Video,
      description: 'Face-to-face virtual consultation with Dr. Ekochin via secure video',
      features: ['Visual assessment', 'Real-time interaction', 'Digital prescriptions', 'Best for new patients'],
      recommended: true
    },
    {
      id: 'audio',
      title: 'Audio Consultation',
      price: '$65',
      duration: '30 minutes',
      icon: Phone,
      description: 'Voice-only consultation perfect for follow-ups and discussions',
      features: ['High-quality audio', 'Lower bandwidth needed', 'Perfect for follow-ups', 'Private & secure'],
      recommended: false
    },
    {
      id: 'message',
      title: 'Messaging Consultation',
      price: '$45',
      duration: '24-48 hours response',
      icon: MessageSquare,
      description: 'Text-based consultation for non-urgent medical questions',
      features: ['Detailed written response', 'Flexible timing', 'Medical advice & guidance', 'Document sharing'],
      recommended: false
    }
  ];

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-3 dark:text-medical-dark-text-primary">
          Choose Your Consultation Type
        </h2>
        <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
          Select the consultation format that best suits your needs
        </p>
      </div>
      
      <RadioGroup
        value={bookingData.consultationType}
        onValueChange={(value) => updateBookingData({ consultationType: value })}
        className="space-y-4"
      >
        {consultationTypes.map((type) => (
          <Card 
            key={type.id} 
            className={`cursor-pointer transition-all border-2 ${
              bookingData.consultationType === type.id 
                ? 'border-medical-primary dark:border-medical-accent bg-medical-primary/5 dark:bg-medical-accent/5' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700'
            } ${type.recommended ? 'ring-2 ring-medical-primary/20 dark:ring-medical-accent/20' : ''}`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-medical-primary/10 dark:bg-medical-accent/20 flex items-center justify-center">
                        <type.icon className="h-6 w-6 text-medical-primary dark:text-medical-accent" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={type.id} className="text-lg font-semibold cursor-pointer dark:text-medical-dark-text-primary">
                            {type.title}
                          </Label>
                          {type.recommended && (
                            <span className="px-2 py-1 bg-medical-primary/10 dark:bg-medical-accent/20 text-medical-primary dark:text-medical-accent text-xs rounded-full font-medium">
                              Recommended
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {type.duration}
                          </div>
                          <div className="font-semibold text-medical-primary dark:text-medical-accent">
                            {type.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary mb-4">
                    {type.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {type.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="dark:text-medical-dark-text-secondary">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </RadioGroup>
      
      <div className="mt-8 p-4 bg-medical-primary/5 dark:bg-medical-accent/5 rounded-lg">
        <h3 className="font-semibold mb-2 dark:text-medical-dark-text-primary">All consultations include:</h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Personalized medical advice
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Secure, HIPAA-compliant platform
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Follow-up recommendations
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Prescription when appropriate
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ConsultationTypeStep;
