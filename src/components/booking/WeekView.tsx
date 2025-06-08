
import React from 'react';
import { format, addDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
  priority: 'high' | 'medium' | 'low';
  reason?: string;
}

interface WeekViewProps {
  currentWeek: Date;
  selectedDate: Date | undefined;
  availableSlots: Record<string, TimeSlot[]>;
  timeFilter: 'all' | 'morning' | 'afternoon' | 'evening';
  onWeekChange: (newWeek: Date) => void;
  onDateSelect: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({
  currentWeek,
  selectedDate,
  availableSlots,
  timeFilter,
  onWeekChange,
  onDateSelect
}) => {
  const getWeekDays = () => {
    const start = startOfWeek(currentWeek);
    const end = endOfWeek(currentWeek);
    return eachDayOfInterval({ start, end }).filter(date => date.getDay() !== 0);
  };

  const getAvailableTimesForDate = (date: Date) => {
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
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Week of {format(currentWeek, 'MMM d, yyyy')}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange(addDays(currentWeek, -7))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onWeekChange(addDays(currentWeek, 7))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {getWeekDays().map((date) => {
            const availableTimes = getAvailableTimesForDate(date);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "p-3 rounded-lg border-2 cursor-pointer transition-all",
                  isSelected ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" :
                  availableTimes.length > 0 ? "border-gray-200 dark:border-gray-700 hover:border-blue-300" :
                  "border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed"
                )}
                onClick={() => availableTimes.length > 0 && onDateSelect(date)}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {format(date, 'EEE')}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {format(date, 'd')}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {availableTimes.length} slots
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WeekView;
