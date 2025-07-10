import React from "react";
import { useCallback } from 'react';
import { format, addDays, isPast } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
  priority: 'high' | 'medium' | 'low';
  reason?: string;
}

interface CalendarViewProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  availableSlots: Record<string, TimeSlot[]>;
  timeFilter: 'all' | 'morning' | 'afternoon' | 'evening';
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = React.memo(({
  selectedDate,
  selectedTime,
  availableSlots,
  timeFilter,
  onDateSelect,
  onTimeSelect
}) => {
  const getAvailableTimesForDate = useCallback((date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const slots = availableSlots[dateKey] || [];
    return slots.filter(slot => {
      if (!slot.available) return false;
      if (timeFilter === 'all') return true;
      
      const hour = parseInt(slot.time.split(':')[0]);
      const isPM = slot.time.includes('PM');
      const hour24 = isPM && hour !== 12 ? hour + 12 : hour;
      
      switch (timeFilter) {
        case 'morning': return hour24 < 12;
        case 'afternoon': return hour24 >= 12 && hour24 < 17;
        case 'evening': return hour24 >= 17;
        default: return true;
      }
    });
  }, [availableSlots, timeFilter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={useCallback((date: Date) => {
              if (isPast(date)) return true;
              const dateKey = format(date, 'yyyy-MM-dd');
              const slots = availableSlots[dateKey] || [];
              return !slots.some(slot => slot.available);
            }, [availableSlots])}
            fromDate={new Date()}
            toDate={addDays(new Date(), 30)}
            className="rounded-md border-0"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Available Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="space-y-4">
              {getAvailableTimesForDate(selectedDate).length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {getAvailableTimesForDate(selectedDate).map((slot) => (
                    <Button
                      key={slot.time}
                      variant={selectedTime === slot.time ? "default" : "outline"}
                      className={cn(
                        "py-3 transition-all relative",
                        selectedTime === slot.time && "bg-blue-600 hover:bg-blue-700",
                        slot.priority === 'high' && selectedTime !== slot.time && "border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900/20"
                      )}
                      onClick={() => onTimeSelect(slot.time)}
                    >
                      {slot.time}
                      {slot.priority === 'high' && (
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full"></span>
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No available times for {format(selectedDate, 'PPP')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Select a date to see available times
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

export default CalendarView;
