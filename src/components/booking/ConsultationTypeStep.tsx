
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Phone, Clock, DollarSign, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConsultationTypeStepProps {
  bookingData: {
    consultationType: 'video' | 'audio' | '';
  };
  updateBookingData: (data: { consultationType: 'video' | 'audio' }) => void;
}

const ConsultationTypeStep: React.FC<ConsultationTypeStepProps> = ({
  bookingData,
  updateBookingData
}) => {
  const consultationTypes = [
    {
      id: 'video' as const,
      title: 'Video Consultation',
      description: 'Face-to-face consultation with full visual examination',
      icon: Video,
      duration: '30 minutes',
      price: '$75',
      features: [
        'HD video call',
        'Visual examination',
        'Screen sharing',
        'Recording available'
      ],
      recommended: true
    },
    {
      id: 'audio' as const,
      title: 'Audio Consultation',
      description: 'Voice-only consultation for follow-ups and general advice',
      icon: Phone,
      duration: '20 minutes',
      price: '$45',
      features: [
        'High-quality audio',
        'Secure connection',
        'Text chat support',
        'Lower bandwidth'
      ],
      recommended: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 dark:text-medical-dark-text-primary">
          Choose Your Consultation Type
        </h2>
        <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
          Select the consultation format that works best for you
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {consultationTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = bookingData.consultationType === type.id;

          return (
            <Card
              key={type.id}
              className={cn(
                "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
                isSelected
                  ? "ring-2 ring-medical-primary dark:ring-medical-accent border-medical-primary dark:border-medical-accent"
                  : "hover:border-medical-primary/50 dark:hover:border-medical-accent/50"
              )}
              onClick={() => updateBookingData({ consultationType: type.id })}
            >
              {type.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-medical-primary text-white dark:bg-medical-accent">
                    Recommended
                  </Badge>
                </div>
              )}

              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors",
                    isSelected
                      ? "bg-medical-primary text-white dark:bg-medical-accent"
                      : "bg-medical-neutral-100 text-medical-primary dark:bg-medical-dark-surface dark:text-medical-accent"
                  )}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 dark:text-medical-dark-text-primary">
                    {type.title}
                  </h3>
                  <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary text-sm">
                    {type.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Pricing and Duration */}
                  <div className="flex justify-between items-center p-3 bg-medical-neutral-50 dark:bg-medical-dark-surface rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-medical-neutral-500" />
                      <span className="text-sm dark:text-medical-dark-text-secondary">
                        {type.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-medical-neutral-500" />
                      <span className="text-lg font-semibold text-medical-primary dark:text-medical-accent">
                        {type.price}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 dark:text-medical-dark-text-primary">
                      <Shield className="h-4 w-4" />
                      What's included:
                    </h4>
                    <ul className="space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-medical-primary dark:bg-medical-accent rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Button
                  className={cn(
                    "w-full mt-6 transition-all",
                    isSelected
                      ? "bg-medical-primary hover:bg-medical-primary/90 dark:bg-medical-accent dark:hover:bg-medical-accent/90"
                      : "bg-medical-neutral-100 text-medical-neutral-700 hover:bg-medical-neutral-200 dark:bg-medical-dark-surface dark:text-medical-dark-text-secondary dark:hover:bg-medical-dark-surface/80"
                  )}
                  variant={isSelected ? "default" : "outline"}
                >
                  {isSelected ? "Selected" : "Select This Option"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Information */}
      <div className="bg-medical-neutral-50 dark:bg-medical-dark-surface rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Users className="h-5 w-5 text-medical-primary dark:text-medical-accent mt-0.5" />
          <div>
            <h4 className="font-medium mb-2 dark:text-medical-dark-text-primary">
              All consultations include:
            </h4>
            <ul className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary space-y-1">
              <li>• Secure, HIPAA-compliant platform</li>
              <li>• Consultation summary and recommendations</li>
              <li>• Follow-up support via message</li>
              <li>• Prescription services when appropriate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationTypeStep;
