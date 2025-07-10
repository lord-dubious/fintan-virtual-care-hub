import React from "react";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddToCalendarButton } from 'add-to-calendar-button-react';

interface AppointmentConfirmationProps {
  selectedDate: Date;
  selectedTime: string;
}

const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  selectedDate,
  selectedTime
}) => {
  const appointmentDateTime = format(selectedDate, 'yyyy-MM-dd');
  const appointmentEndTime = selectedTime.split(':').map(Number);
  const endHour = appointmentEndTime[0] + 1; // Assuming 1-hour appointments
  const endTime = `${endHour.toString().padStart(2, '0')}:${appointmentEndTime[1].toString().padStart(2, '0')}`;

  return (
    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-300">
                Appointment Selected
              </h4>
              <p className="text-green-600 dark:text-green-400">
                {format(selectedDate, 'PPP')} at {selectedTime}
              </p>
            </div>
          </div>
          <div className="ml-4">
            <AddToCalendarButton
              name="Virtual Consultation with Dr. Fintan Ekochin"
              options={['Apple', 'Google', 'Outlook.com', 'Yahoo']}
              location="Virtual Meeting (Link will be provided)"
              startDate={appointmentDateTime}
              endDate={appointmentDateTime}
              startTime={selectedTime}
              endTime={endTime}
              timeZone="currentBrowser"
              description="Virtual medical consultation with Dr. Fintan Ekochin. Meeting link and instructions will be sent via email."
              buttonStyle="round"
              size="3"
              lightMode="bodyScheme"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentConfirmation;
