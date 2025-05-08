
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Video, Phone } from "lucide-react";

interface ConsultationTypeStepProps {
  bookingData: {
    consultationType: string;
  };
  updateBookingData: (data: { consultationType: string }) => void;
}

const ConsultationTypeStep: React.FC<ConsultationTypeStepProps> = ({ bookingData, updateBookingData }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 dark:text-medical-dark-text-primary">Choose Consultation Type</h2>
      
      <RadioGroup
        value={bookingData.consultationType}
        onValueChange={(value) => updateBookingData({ consultationType: value })}
        className="space-y-4"
      >
        <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="flex items-start">
            <RadioGroupItem value="video" id="video" className="mt-1" />
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <Label htmlFor="video" className="text-lg font-medium dark:text-medical-dark-text-primary">Video Consultation</Label>
                  <p className="mt-1 text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                    Face-to-face virtual consultation with Dr. Fintan via secure video.
                  </p>
                </div>
                <Video className="h-6 w-6 text-medical-primary dark:text-medical-accent" />
              </div>
              <div className="mt-3 flex items-center">
                <span className="text-lg font-semibold dark:text-medical-dark-text-primary">$85.00</span>
                <span className="ml-2 text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">(30 minutes)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="flex items-start">
            <RadioGroupItem value="audio" id="audio" className="mt-1" />
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <Label htmlFor="audio" className="text-lg font-medium dark:text-medical-dark-text-primary">Audio Consultation</Label>
                  <p className="mt-1 text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                    Voice-only consultation with Dr. Fintan via secure connection.
                  </p>
                </div>
                <Phone className="h-6 w-6 text-medical-primary dark:text-medical-accent" />
              </div>
              <div className="mt-3 flex items-center">
                <span className="text-lg font-semibold dark:text-medical-dark-text-primary">$65.00</span>
                <span className="ml-2 text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">(30 minutes)</span>
              </div>
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
};

export default ConsultationTypeStep;
