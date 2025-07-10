import React from "react";

import { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { RotateCcw as RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { usePatientProfileForBooking } from '@/hooks/usePatientProfile';

interface PatientInfoStepProps {
  bookingData: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    dateOfBirth: Date | null;
    reason: string;
    reasonAudio?: string;
  };
  updateBookingData: (data: {
    patientName?: string;
    patientEmail?: string;
    patientPhone?: string;
    dateOfBirth?: Date | null;
    reason?: string;
    reasonAudio?: string;
  }) => void;
}

const PatientInfoStep: React.FC<PatientInfoStepProps> = ({
  bookingData,
  updateBookingData
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [hasAutoPopulated, setHasAutoPopulated] = useState(false);

  // Get patient profile data for auto-population
  const {
    patientData,
    formData,
    isLoading: isLoadingProfile,
    isProfileComplete,
    canSkipPersonalInfo
  } = usePatientProfileForBooking();

  // Auto-populate form fields when profile data is available
  useEffect(() => {
    if (formData && !hasAutoPopulated && isProfileComplete) {
      // Only auto-populate if the current fields are empty
      const shouldPopulate = !bookingData.patientName && !bookingData.patientEmail && !bookingData.patientPhone;

      if (shouldPopulate) {
        updateBookingData({
          patientName: formData.patientName || '',
          patientEmail: formData.patientEmail || '',
          patientPhone: formData.patientPhone || '',
          dateOfBirth: formData.dateOfBirth || null,
        });

        setHasAutoPopulated(true);

        toast({
          title: "Information loaded",
          description: "Your profile information has been automatically filled in.",
        });
      }
    }
  }, [formData, hasAutoPopulated, isProfileComplete, bookingData, updateBookingData, toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        updateBookingData({ reasonAudio: URL.createObjectURL(blob) });
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      toast({
        title: "Recording started",
        description: "Describe your health concerns or symptoms"
      });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Please allow microphone access to record",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      
      toast({
        title: "Recording saved",
        description: "Your voice description has been recorded"
      });
    }
  };

  const playRecording = () => {
    if (audioBlob && !isPlaying) {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      };
      audio.play();
      setCurrentAudio(audio);
      setIsPlaying(true);
    } else if (currentAudio && isPlaying) {
      currentAudio.pause();
      setIsPlaying(false);
      setCurrentAudio(null);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setIsPlaying(false);
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
    }
    updateBookingData({ reasonAudio: undefined });

    toast({
      title: "Recording deleted",
      description: "Voice recording has been removed"
    });
  };

  const loadFromProfile = () => {
    if (formData) {
      updateBookingData({
        patientName: formData.patientName || '',
        patientEmail: formData.patientEmail || '',
        patientPhone: formData.patientPhone || '',
        dateOfBirth: formData.dateOfBirth || null,
      });

      toast({
        title: "Profile loaded",
        description: "Your information has been updated from your profile.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2 dark:text-white`}>
          Your Information
        </h2>
        <p className={`text-gray-600 dark:text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
          Please provide your details for the consultation
        </p>
      </div>

      {/* Profile Status Indicator */}
      {!isLoadingProfile && (
        <div className="mb-6">
          {isProfileComplete ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-300">
                <strong>Profile Complete!</strong> Your information has been automatically filled from your profile.
                You can edit any field if needed.
              </AlertDescription>
            </Alert>
          ) : canSkipPersonalInfo ? (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-300">
                <strong>Quick Setup:</strong> Some information has been filled from your account.
                Complete your profile after booking to save time on future appointments.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
              <User className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-300">
                <strong>First Time Booking:</strong> Please fill in your information below.
                You can complete your profile after booking to save time on future appointments.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {isLoadingProfile && (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading your profile...</span>
        </div>
      )}

      {/* Load from Profile Button */}
      {formData && !isProfileComplete && (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            onClick={loadFromProfile}
            className="text-blue-600 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-600 dark:hover:bg-blue-900/20"
          >
            <User className="mr-2 h-4 w-4" />
            Load from Profile
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientName" className="dark:text-gray-200">
            Full Name *
          </Label>
          <Input
            id="patientName"
            value={bookingData.patientName}
            onChange={(e) => updateBookingData({ patientName: e.target.value })}
            placeholder="Enter your full name"
            className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="patientEmail" className="dark:text-gray-200">
            Email Address *
          </Label>
          <Input
            id="patientEmail"
            type="email"
            value={bookingData.patientEmail}
            onChange={(e) => updateBookingData({ patientEmail: e.target.value })}
            placeholder="your@email.com"
            className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="patientPhone" className="dark:text-gray-200">
            Phone Number *
          </Label>
          <Input
            id="patientPhone"
            type="tel"
            value={bookingData.patientPhone}
            onChange={(e) => updateBookingData({ patientPhone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? 'h-10 text-sm' : 'h-11'}`}
          />
        </div>

        <div className="space-y-2">
          <Label className="dark:text-gray-200">Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600",
                  !bookingData.dateOfBirth && "text-muted-foreground",
                  isMobile ? 'h-10 text-sm' : 'h-11'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {bookingData.dateOfBirth ? (
                  format(bookingData.dateOfBirth, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-600">
              <Calendar
                mode="single"
                selected={bookingData.dateOfBirth || undefined}
                onSelect={(date) => updateBookingData({ dateOfBirth: date || null })}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="dark:bg-gray-800"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reason" className="dark:text-gray-200">
            Reason for Consultation *
          </Label>
          <Textarea
            id="reason"
            value={bookingData.reason}
            onChange={(e) => updateBookingData({ reason: e.target.value })}
            placeholder="Please describe your symptoms, concerns, or the reason for your consultation..."
            rows={isMobile ? 3 : 4}
            className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white ${isMobile ? 'text-sm' : ''}`}
          />
        </div>

        {/* Voice Recording Section */}
        <div className="bg-blue-50 dark:bg-gray-800/50 rounded-lg p-4 border border-blue-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-blue-800 dark:text-blue-300 font-medium">
              Voice Description (Optional)
            </Label>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Record your concerns
            </div>
          </div>
          
          <p className={`text-blue-700 dark:text-blue-300 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            You can record a voice message to better describe your symptoms or health concerns.
          </p>

          <div className="flex items-center gap-3">
            {!audioBlob ? (
              <Button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                size={isMobile ? "sm" : "default"}
                className={`${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="mr-2 h-4 w-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={playRecording}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Play
                    </>
                  )}
                </Button>
                
                <Button
                  type="button"
                  onClick={deleteRecording}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                
                <Button
                  type="button"
                  onClick={startRecording}
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Re-record
                </Button>
              </div>
            )}
          </div>

          {isRecording && (
            <div className="mt-3 flex items-center gap-2">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className={`text-red-600 dark:text-red-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                Recording in progress...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientInfoStep;
