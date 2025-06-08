
import React from 'react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar as CalendarPlus } from "lucide-react";

interface AppointmentConfirmationProps {
  selectedDate: Date;
  selectedTime: string;
}

const AppointmentConfirmation: React.FC<AppointmentConfirmationProps> = ({
  selectedDate,
  selectedTime
}) => {
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
          <Button
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Add to Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentConfirmation;
