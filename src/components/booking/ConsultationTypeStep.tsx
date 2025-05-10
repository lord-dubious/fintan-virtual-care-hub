
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Video, Phone, MessageSquare } from "lucide-react";

interface ConsultationTypeStepProps {
  bookingData: {
    consultationType: string;
    platform?: string;
  };
  updateBookingData: (data: { consultationType: string; platform?: string }) => void;
}

const ConsultationTypeStep: React.FC<ConsultationTypeStepProps> = ({ bookingData, updateBookingData }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 dark:text-medical-dark-text-primary">Choose Consultation Type</h2>
      
      <RadioGroup
        value={bookingData.consultationType}
        onValueChange={(value) => updateBookingData({ consultationType: value, platform: undefined })}
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
              
              {/* Video platform selection */}
              {bookingData.consultationType === "video" && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm font-medium mb-2 dark:text-medical-dark-text-primary">Select platform preference:</p>
                  <RadioGroup 
                    value={bookingData.platform || "drfintan"}
                    onValueChange={(platform) => updateBookingData({ ...bookingData, platform })}
                    className="space-y-2"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="drfintan" id="drfintan" />
                      <Label htmlFor="drfintan" className="ml-2 text-sm dark:text-medical-dark-text-secondary">Dr. Fintan Secure Platform</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="zoom" id="zoom" />
                      <Label htmlFor="zoom" className="ml-2 text-sm dark:text-medical-dark-text-secondary">Zoom</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="facetime" id="facetime" />
                      <Label htmlFor="facetime" className="ml-2 text-sm dark:text-medical-dark-text-secondary">FaceTime (Apple devices)</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="whatsapp" id="whatsapp" />
                      <Label htmlFor="whatsapp" className="ml-2 text-sm dark:text-medical-dark-text-secondary">WhatsApp Video</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
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
              
              {/* Audio platform selection */}
              {bookingData.consultationType === "audio" && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm font-medium mb-2 dark:text-medical-dark-text-primary">Select platform preference:</p>
                  <RadioGroup 
                    value={bookingData.platform || "phone"}
                    onValueChange={(platform) => updateBookingData({ ...bookingData, platform })}
                    className="space-y-2"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="phone" id="phone" />
                      <Label htmlFor="phone" className="ml-2 text-sm dark:text-medical-dark-text-secondary">Phone Call</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="whatsapp_audio" id="whatsapp_audio" />
                      <Label htmlFor="whatsapp_audio" className="ml-2 text-sm dark:text-medical-dark-text-secondary">WhatsApp Audio Call</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="facetime_audio" id="facetime_audio" />
                      <Label htmlFor="facetime_audio" className="ml-2 text-sm dark:text-medical-dark-text-secondary">FaceTime Audio</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
          <div className="flex items-start">
            <RadioGroupItem value="message" id="message" className="mt-1" />
            <div className="ml-3 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <Label htmlFor="message" className="text-lg font-medium dark:text-medical-dark-text-primary">Messaging Consultation</Label>
                  <p className="mt-1 text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                    Text-based consultation for non-urgent matters and quick questions.
                  </p>
                </div>
                <MessageSquare className="h-6 w-6 text-medical-primary dark:text-medical-accent" />
              </div>
              
              {/* Messaging platform selection */}
              {bookingData.consultationType === "message" && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                  <p className="text-sm font-medium mb-2 dark:text-medical-dark-text-primary">Select platform preference:</p>
                  <RadioGroup 
                    value={bookingData.platform || "patient_portal"}
                    onValueChange={(platform) => updateBookingData({ ...bookingData, platform })}
                    className="space-y-2"
                  >
                    <div className="flex items-center">
                      <RadioGroupItem value="patient_portal" id="patient_portal" />
                      <Label htmlFor="patient_portal" className="ml-2 text-sm dark:text-medical-dark-text-secondary">Patient Portal</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="whatsapp_message" id="whatsapp_message" />
                      <Label htmlFor="whatsapp_message" className="ml-2 text-sm dark:text-medical-dark-text-secondary">WhatsApp</Label>
                    </div>
                    <div className="flex items-center">
                      <RadioGroupItem value="sms" id="sms" />
                      <Label htmlFor="sms" className="ml-2 text-sm dark:text-medical-dark-text-secondary">SMS</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          </div>
        </div>
      </RadioGroup>
      
      <div className="mt-6 text-sm text-medical-neutral-500 dark:text-medical-dark-text-secondary">
        <p className="mb-1">All consultations include:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Personalized care from Dr. Fintan</li>
          <li>Secure, private communication</li>
          <li>Follow-up instructions and treatment plans</li>
          <li>Option for prescription renewal when appropriate</li>
        </ul>
      </div>
    </div>
  );
};

export default ConsultationTypeStep;
