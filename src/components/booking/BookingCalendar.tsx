import React, { useState, useEffect } from 'react';
import { format, addDays, isPast, isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Calendar as CalendarPlus, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface BookingDate {
  date: string;
  availableTimes: string[];
  bookedTimes: string[];
}

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
  className?: string;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  className
}) => {
  const { toast } = useToast();
  const [bookingData, setBookingData] = useState<BookingDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCalendarOptions, setShowCalendarOptions] = useState(false);
  
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockData: BookingDate[] = [];
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
          const date = addDays(today, i);
          
          if (date.getDay() === 0) continue;
          
          const availableTimes = [];
          const bookedTimes = [];
          
          if (date.getDay() >= 1 && date.getDay() <= 5) {
            availableTimes.push(
              "09:00 AM", 
              "10:00 AM", 
              "11:00 AM", 
              "01:00 PM", 
              "02:00 PM", 
              "03:00 PM",
              "04:00 PM"
            );
            
            const randomBooked = Math.floor(Math.random() * 3);
            for (let j = 0; j < randomBooked; j++) {
              const randomIndex = Math.floor(Math.random() * availableTimes.length);
              bookedTimes.push(availableTimes[randomIndex]);
              availableTimes.splice(randomIndex, 1);
            }
          } else if (date.getDay() === 6) {
            availableTimes.push("09:00 AM", "10:00 AM", "11:00 AM");
            
            if (Math.random() > 0.5) {
              const randomIndex = Math.floor(Math.random() * availableTimes.length);
              bookedTimes.push(availableTimes[randomIndex]);
              availableTimes.splice(randomIndex, 1);
            }
          }
          
          mockData.push({
            date: format(date, 'yyyy-MM-dd'),
            availableTimes,
            bookedTimes
          });
        }
        
        setBookingData(mockData);
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAvailability();
  }, []);

  const getAvailableTimesForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    const dateString = format(date, 'yyyy-MM-dd');
    const dateData = bookingData.find(d => d.date === dateString);
    
    return dateData?.availableTimes || [];
  };
  
  const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

  const handleAddToCalendar = (type: 'google' | 'apple' | 'outlook') => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Please select a date and time first",
        variant: "destructive"
      });
      return;
    }

    // In a real implementation, these would generate actual calendar links
    switch (type) {
      case 'google':
        toast({
          title: "Adding to Google Calendar",
          description: "Opening Google Calendar in a new tab..."
        });
        break;
      case 'apple':
        toast({
          title: "Adding to Apple Calendar",
          description: "Downloading .ics file..."
        });
        break;
      case 'outlook':
        toast({
          title: "Adding to Outlook",
          description: "Opening Outlook calendar in a new tab..."
        });
        break;
    }
    setShowCalendarOptions(false);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex flex-col w-full md:w-auto">
          <h3 className="text-lg font-medium mb-4 dark:text-medical-dark-text-primary">Select a Date</h3>
          <Card className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={onDateSelect}
              disabled={(date) => isPast(date) || date.getDay() === 0}
              fromDate={new Date()}
              toDate={addDays(new Date(), 30)}
              className="rounded-md border dark:border-gray-700"
              modifiersClassNames={{
                selected: "bg-medical-primary text-white hover:bg-medical-primary hover:text-white dark:bg-medical-accent dark:text-medical-dark-surface",
                today: "bg-medical-bg-light text-medical-primary font-bold dark:bg-medical-dark-surface dark:text-medical-accent"
              }}
              modifiers={{
                available: (date) => {
                  const dateString = format(date, 'yyyy-MM-dd');
                  const dateData = bookingData.find(d => d.date === dateString);
                  return dateData?.availableTimes.length ? true : false;
                }
              }}
              modifiersStyles={{
                available: {
                  color: 'var(--medical-primary)',
                  backgroundColor: 'rgba(var(--medical-primary-rgb), 0.1)',
                  fontWeight: 500
                }
              }}
            />
          </Card>
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-4 dark:text-medical-dark-text-primary">Available Times</h3>
          
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center items-center h-40">
                <div className="animate-pulse flex flex-col items-center">
                  <Clock className="h-8 w-8 text-medical-primary dark:text-medical-accent mb-2" />
                  <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary">
                    Loading available times...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : selectedDate ? (
            <Card>
              <CardContent className="p-6">
                {availableTimes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {availableTimes.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className={cn(
                          "py-6 transition-all",
                          selectedTime === time 
                            ? "bg-medical-primary hover:bg-medical-primary/90 text-white dark:bg-medical-accent dark:hover:bg-medical-accent/90" 
                            : "dark:bg-transparent dark:text-medical-dark-text-primary dark:hover:bg-medical-primary/20"
                        )}
                        onClick={() => onTimeSelect(time)}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                      No available time slots for {format(selectedDate, 'PPP')}.
                    </p>
                    <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary mt-2">
                      Please select a different date.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <CalendarIcon className="h-8 w-8 text-medical-neutral-400 dark:text-medical-dark-text-secondary mb-2" />
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                  Please select a date to see available times
                </p>
              </CardContent>
            </Card>
          )}
          
          {selectedDate && selectedTime && (
            <Card className="mt-6">
              <CardContent className="p-6">
                <h4 className="font-medium text-medical-primary dark:text-medical-accent mb-2">Selected Appointment</h4>
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-primary mb-4">
                  {format(selectedDate, 'PPP')} at {selectedTime}
                </p>
                
                <Popover open={showCalendarOptions} onOpenChange={setShowCalendarOptions}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Add to Calendar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start mb-1"
                      onClick={() => handleAddToCalendar('google')}
                    >
                      Add to Google Calendar
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start mb-1"
                      onClick={() => handleAddToCalendar('apple')}
                    >
                      Add to Apple Calendar
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleAddToCalendar('outlook')}
                    >
                      Add to Outlook
                    </Button>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;