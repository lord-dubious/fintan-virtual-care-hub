
import React, { useState, useEffect } from 'react';
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import SmartSuggestionsView from './SmartSuggestionsView';
import WeekView from './WeekView';
import CalendarView from './CalendarView';
import AppointmentConfirmation from './AppointmentConfirmation';
import ViewModeSelector from './ViewModeSelector';
import TimeFilter from './TimeFilter';

interface EnhancedBookingCalendarProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  consultationType: string;
  providerId?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  priority: 'high' | 'medium' | 'low';
  reason?: string;
}

interface SmartSuggestion {
  date: Date;
  time: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  discount?: number;
}

const EnhancedBookingCalendar: React.FC<EnhancedBookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  consultationType,
  providerId
}) => {
  const { toast } = useToast();
  const [availableSlots, setAvailableSlots] = useState<Record<string, TimeSlot[]>>({});
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'calendar' | 'week' | 'suggestions'>('suggestions');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');

  useEffect(() => {
    const fetchAvailabilityAndSuggestions = async () => {
      setIsLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const slots: Record<string, TimeSlot[]> = {};
      const suggestions: SmartSuggestion[] = [];
      const today = new Date();
      
      // Generate availability for next 30 days
      for (let i = 0; i < 30; i++) {
        const date = addDays(today, i);
        if (date.getDay() === 0) continue; // Skip Sundays
        
        const dateKey = format(date, 'yyyy-MM-dd');
        const timeSlots: TimeSlot[] = [];
        
        // Generate time slots with smart prioritization
        if (date.getDay() >= 1 && date.getDay() <= 5) {
          const morningSlots = [
            { time: "08:00 AM", available: true, priority: 'high' as const, reason: 'Early bird special' },
            { time: "09:00 AM", available: true, priority: 'high' as const },
            { time: "10:00 AM", available: true, priority: 'medium' as const },
            { time: "11:00 AM", available: true, priority: 'medium' as const },
          ];
          const afternoonSlots = [
            { time: "01:00 PM", available: true, priority: 'medium' as const },
            { time: "02:00 PM", available: true, priority: 'high' as const, reason: 'Popular time' },
            { time: "03:00 PM", available: true, priority: 'medium' as const },
            { time: "04:00 PM", available: true, priority: 'low' as const },
            { time: "05:00 PM", available: true, priority: 'low' as const },
          ];
          timeSlots.push(...morningSlots, ...afternoonSlots);
        } else if (date.getDay() === 6) {
          timeSlots.push(
            { time: "09:00 AM", available: true, priority: 'medium' as const, reason: 'Weekend availability' },
            { time: "10:00 AM", available: true, priority: 'medium' as const },
            { time: "11:00 AM", available: true, priority: 'low' as const },
          );
        }
        
        // Randomly make some slots unavailable
        const availableSlots = timeSlots.map(slot => ({
          ...slot,
          available: Math.random() > 0.3
        }));
        
        slots[dateKey] = availableSlots;
      }
      
      // Generate smart suggestions
      const nextAvailableSlots = Object.entries(slots)
        .filter(([_, times]) => times.some(t => t.available))
        .slice(0, 6);
      
      nextAvailableSlots.forEach(([dateStr, times], index) => {
        const date = new Date(dateStr);
        const availableTimes = times.filter(t => t.available);
        if (availableTimes.length === 0) return;
        
        let reason = '';
        let priority: 'high' | 'medium' | 'low' = 'medium';
        let discount = undefined;
        
        if (isToday(date)) {
          reason = 'Available today - Same day consultation';
          priority = 'high';
          discount = 20;
        } else if (isTomorrow(date)) {
          reason = 'Available tomorrow - Next day appointment';
          priority = 'high';
          discount = 15;
        } else if (date.getDay() === 1) {
          reason = 'Monday morning - Fresh start to your week';
          priority = 'medium';
        } else if (date.getDay() === 6) {
          reason = 'Weekend slot - Flexible timing';
          priority = 'low';
        } else if (availableTimes.some(t => t.priority === 'high')) {
          reason = 'Premium time slot - High availability';
          priority = 'high';
        } else {
          reason = `${format(date, 'EEEE')} appointment - Good availability`;
          priority = 'medium';
        }
        
        suggestions.push({
          date,
          time: availableTimes[0].time,
          reason,
          priority,
          discount
        });
      });
      
      setAvailableSlots(slots);
      setSmartSuggestions(suggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }));
      setIsLoading(false);
    };
    
    fetchAvailabilityAndSuggestions();
  }, []);

  const handleQuickSelect = (suggestion: SmartSuggestion) => {
    onDateSelect(suggestion.date);
    onTimeSelect(suggestion.time);
    toast({
      title: "Appointment Time Selected",
      description: `${format(suggestion.date, 'PPP')} at ${suggestion.time}`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />
      
      <TimeFilter timeFilter={timeFilter} onTimeFilterChange={setTimeFilter} />

      {viewMode === 'suggestions' && (
        <SmartSuggestionsView 
          suggestions={smartSuggestions} 
          onSuggestionSelect={handleQuickSelect} 
        />
      )}

      {viewMode === 'week' && (
        <WeekView
          currentWeek={currentWeek}
          selectedDate={selectedDate}
          availableSlots={availableSlots}
          timeFilter={timeFilter}
          onWeekChange={setCurrentWeek}
          onDateSelect={onDateSelect}
        />
      )}

      {viewMode === 'calendar' && (
        <CalendarView
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          availableSlots={availableSlots}
          timeFilter={timeFilter}
          onDateSelect={onDateSelect}
          onTimeSelect={onTimeSelect}
        />
      )}

      {selectedDate && selectedTime && (
        <AppointmentConfirmation 
          selectedDate={selectedDate} 
          selectedTime={selectedTime} 
        />
      )}
    </div>
  );
};

export default EnhancedBookingCalendar;
