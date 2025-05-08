
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PatientInfoStepProps {
  bookingData: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    dateOfBirth: Date | null;
    reason: string;
  };
  updateBookingData: (data: Partial<{
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    dateOfBirth: Date | null;
    reason: string;
  }>) => void;
}

const PatientInfoStep: React.FC<PatientInfoStepProps> = ({ bookingData, updateBookingData }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6 dark:text-medical-dark-text-primary">Patient Information</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="patientName" className="dark:text-medical-dark-text-primary">Full Name</Label>
          <Input 
            id="patientName"
            value={bookingData.patientName}
            onChange={(e) => updateBookingData({ patientName: e.target.value })}
            placeholder="Enter your full name"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="patientEmail" className="dark:text-medical-dark-text-primary">Email Address</Label>
          <Input 
            id="patientEmail"
            type="email"
            value={bookingData.patientEmail}
            onChange={(e) => updateBookingData({ patientEmail: e.target.value })}
            placeholder="Enter your email address"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="patientPhone" className="dark:text-medical-dark-text-primary">Phone Number</Label>
          <Input 
            id="patientPhone"
            value={bookingData.patientPhone}
            onChange={(e) => updateBookingData({ patientPhone: e.target.value })}
            placeholder="Enter your phone number"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="dateOfBirth" className="dark:text-medical-dark-text-primary">Date of Birth</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="dateOfBirth"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !bookingData.dateOfBirth && "text-muted-foreground",
                  "dark:bg-transparent dark:text-medical-dark-text-primary dark:hover:bg-medical-primary/20"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {bookingData.dateOfBirth ? (
                  format(bookingData.dateOfBirth, "PPP")
                ) : (
                  <span>Select date of birth</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <Calendar
                mode="single"
                selected={bookingData.dateOfBirth || undefined}
                onSelect={(date) => updateBookingData({ dateOfBirth: date || null })}
                initialFocus
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label htmlFor="reason" className="dark:text-medical-dark-text-primary">Reason for Consultation</Label>
          <Textarea 
            id="reason"
            value={bookingData.reason}
            onChange={(e) => updateBookingData({ reason: e.target.value })}
            placeholder="Please briefly describe your symptoms or reason for consultation"
            className="mt-1"
            rows={4}
          />
        </div>
      </div>
    </div>
  );
};

export default PatientInfoStep;
