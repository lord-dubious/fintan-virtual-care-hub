
import React, { useState, useEffect } from 'react';
import { format, addDays, isPast, isSameDay, isToday, isTomorrow } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CalendarIcon, 
  Clock, 
  Zap, 
  Calendar as CalendarPlus, 
  ArrowRight,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calendarIntegrationService, CalendarEvent } from "@/services/calendarIntegrationService";

interface IntelligentCalendarProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  consultationType: string;
}

interface SmartSuggestion {
  date: Date;
  time: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

const IntelligentCalendar: React.FC<IntelligentCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  consultationType
}) => {
  const { toast } = useToast();
  const [availableSlots, setAvailableSlots] = useState<Record<string, string[]>>({});
  const [smartSuggestions, setSmartSuggestions] = useState<SmartSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);

  useEffect(() => {
    const fetchAvailabilityAndSuggestions = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const slots: Record<string, string[]> = {};
      const suggestions: SmartSuggestion[] = [];
      const today = new Date();
      
      // Generate availability for next 21 days
      for (let i = 0; i < 21; i++) {
        const date = addDays(today, i);
        if (date.getDay() === 0) continue; // Skip Sundays
        
        const dateKey = format(date, 'yyyy-MM-dd');
        const times = [];
        
        // Generate time slots based on day
        if (date.getDay() >= 1 && date.getDay() <= 5) {
          const morningSlots = ["09:00", "10:00", "11:00"];
          const afternoonSlots = ["13:00", "14:00", "15:00", "16:00"];
          times.push(...morningSlots, ...afternoonSlots);
        } else if (date.getDay() === 6) {
          times.push("09:00", "10:00", "11:00");
        }
        
        // Remove random slots to simulate bookings
        const availableSlots = times.filter(() => Math.random() > 0.3);
        slots[dateKey] = availableSlots.map(time => `${time} ${parseInt(time) < 12 ? 'AM' : 'PM'}`);
      }
      
      // Generate smart suggestions
      const nextAvailableSlots = Object.entries(slots)
        .filter(([_, times]) => times.length > 0)
        .slice(0, 5);
      
      nextAvailableSlots.forEach(([dateStr, times], index) => {
        const date = new Date(dateStr);
        let reason = '';
        let priority: 'high' | 'medium' | 'low' = 'medium';
        
        if (isToday(date)) {
          reason = 'Available today - Same day appointment';
          priority = 'high';
        } else if (isTomorrow(date)) {
          reason = 'Available tomorrow - Quick scheduling';
          priority = 'high';
        } else if (date.getDay() === 1) {
          reason = 'Monday morning - Start your week right';
          priority = 'medium';
        } else if (date.getDay() === 6) {
          reason = 'Weekend availability - Flexible timing';
          priority = 'low';
        } else {
          reason = `${format(date, 'EEEE')} appointment - Good availability`;
          priority = 'medium';
        }
        
        suggestions.push({
          date,
          time: times[0],
          reason,
          priority
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

  const handleAddToCalendar = () => {
    if (!selectedDate || !selectedTime) return;
    
    const startTime = new Date(selectedDate);
    const [time, period] = selectedTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const adjustedHours = period === 'PM' && hours !== 12 ? hours + 12 : 
                         period === 'AM' && hours === 12 ? 0 : hours;
    
    startTime.setHours(adjustedHours, minutes || 0, 0, 0);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes
    
    const event: CalendarEvent = {
      id: `consultation_${Date.now()}`,
      title: `${consultationType} Consultation with Dr. Fintan Ekochin`,
      description: `Your ${consultationType.toLowerCase()} consultation with Dr. Fintan Ekochin. Please join 5 minutes early.`,
      start: startTime,
      end: endTime,
      location: consultationType === 'video' ? 'Video Call' : 'Audio Call'
    };

    // Auto-detect best calendar provider
    const userAgent = navigator.userAgent.toLowerCase();
    let provider = 'google'; // default
    
    if (userAgent.includes('mac') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
      provider = 'apple';
    } else if (userAgent.includes('windows')) {
      provider = 'outlook';
    }
    
    calendarIntegrationService.addToCalendar(provider, event);
    
    toast({
      title: "Added to Calendar",
      description: `Appointment added to your ${provider} calendar`,
    });
  };

  const getAvailableTimesForDate = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return availableSlots[dateKey] || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Smart Suggestions */}
      <Card className="overflow-hidden bg-gradient-to-r from-medical-primary/5 to-medical-accent/5 dark:from-medical-primary/10 dark:to-medical-accent/10">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-medical-primary dark:text-medical-accent">
            <Sparkles className="h-5 w-5" />
            Smart Suggestions
          </CardTitle>
          <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
            AI-powered recommendations based on availability and preferences
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {smartSuggestions.slice(0, 3).map((suggestion, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer",
                "hover:border-medical-primary/50 dark:hover:border-medical-accent/50",
                "bg-white dark:bg-medical-dark-surface/50",
                suggestion.priority === 'high' ? "border-green-200 dark:border-green-800" :
                suggestion.priority === 'medium' ? "border-yellow-200 dark:border-yellow-800" :
                "border-gray-200 dark:border-gray-700"
              )}
              onClick={() => handleQuickSelect(suggestion)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium dark:text-medical-dark-text-primary">
                    {format(suggestion.date, 'EEEE, MMM d')} at {suggestion.time}
                  </h4>
                  {suggestion.priority === 'high' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <Zap className="h-3 w-3 mr-1" />
                      Best
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  {suggestion.reason}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-medical-neutral-400 dark:text-medical-dark-text-secondary" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Manual Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar */}
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
              disabled={(date) => {
                if (isPast(date)) return true;
                const dateKey = format(date, 'yyyy-MM-dd');
                return !availableSlots[dateKey] || availableSlots[dateKey].length === 0;
              }}
              fromDate={new Date()}
              toDate={addDays(new Date(), 21)}
              className="rounded-md border-0"
            />
          </CardContent>
        </Card>

        {/* Time Selection */}
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
                    {getAvailableTimesForDate(selectedDate).map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className={cn(
                          "py-3 transition-all",
                          selectedTime === time && "bg-medical-primary hover:bg-medical-primary/90 dark:bg-medical-accent dark:hover:bg-medical-accent/90"
                        )}
                        onClick={() => onTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-medical-neutral-400 dark:text-medical-dark-text-secondary mx-auto mb-3" />
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                      No available times for {format(selectedDate, 'PPP')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-medical-neutral-400 dark:text-medical-dark-text-secondary mx-auto mb-3" />
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Select a date to see available times
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation */}
      {selectedDate && selectedTime && (
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
                onClick={handleAddToCalendar}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300 dark:hover:bg-green-900"
              >
                <CalendarPlus className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IntelligentCalendar;
