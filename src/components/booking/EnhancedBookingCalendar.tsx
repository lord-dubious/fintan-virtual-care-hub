import React, { useState, useEffect } from 'react';
import { format, addDays, isPast, isSameDay, isToday, isTomorrow, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
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
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { calendarIntegrationService, CalendarEvent } from "@/services/calendarIntegrationService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EnhancedBookingCalendarProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  consultationType: string;
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
  consultationType
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

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek);
    const end = endOfWeek(currentWeek);
    return eachDayOfInterval({ start, end }).filter(date => date.getDay() !== 0);
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
      {/* View Mode Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant={viewMode === 'suggestions' ? 'default' : 'outline'}
          onClick={() => setViewMode('suggestions')}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Smart Suggestions
        </Button>
        <Button
          variant={viewMode === 'week' ? 'default' : 'outline'}
          onClick={() => setViewMode('week')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Week View
        </Button>
        <Button
          variant={viewMode === 'calendar' ? 'default' : 'outline'}
          onClick={() => setViewMode('calendar')}
          className="flex items-center gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          Calendar View
        </Button>
      </div>

      {/* Time Filter */}
      <div className="flex items-center gap-4 justify-center">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={timeFilter} onValueChange={(value: any) => setTimeFilter(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Times</SelectItem>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="afternoon">Afternoon</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Smart Suggestions View */}
      {viewMode === 'suggestions' && (
        <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
              AI-Recommended Times
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Optimized suggestions based on availability and your preferences
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {smartSuggestions.slice(0, 4).map((suggestion, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md",
                  "bg-white dark:bg-gray-800/50",
                  suggestion.priority === 'high' ? "border-green-200 dark:border-green-800 hover:border-green-300" :
                  suggestion.priority === 'medium' ? "border-blue-200 dark:border-blue-800 hover:border-blue-300" :
                  "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                )}
                onClick={() => handleQuickSelect(suggestion)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {format(suggestion.date, 'EEEE, MMM d')} at {suggestion.time}
                    </h4>
                    {suggestion.priority === 'high' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                        <Zap className="h-3 w-3 mr-1" />
                        Recommended
                      </Badge>
                    )}
                    {suggestion.discount && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                        {suggestion.discount}% off
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion.reason}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Week of {format(currentWeek, 'MMM d, yyyy')}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
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
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
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
                disabled={(date) => {
                  if (isPast(date)) return true;
                  const dateKey = format(date, 'yyyy-MM-dd');
                  const slots = availableSlots[dateKey] || [];
                  return !slots.some(slot => slot.available);
                }}
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
      )}

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

export default EnhancedBookingCalendar;
