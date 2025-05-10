
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
import { CalendarIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  // In a real implementation, this data would come from an API
  const [bookingData, setBookingData] = useState<BookingDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate API call to fetch available dates and times
  useEffect(() => {
    // This would be an API call in production
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate mock data for the next 30 days
        const mockData: BookingDate[] = [];
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
          const date = addDays(today, i);
          
          // Skip Sundays
          if (date.getDay() === 0) continue;
          
          // Create different availability patterns
          const availableTimes = [];
          const bookedTimes = [];
          
          // Monday to Friday: More slots
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
            
            // Randomly mark some times as booked
            const randomBooked = Math.floor(Math.random() * 3);
            for (let j = 0; j < randomBooked; j++) {
              const randomIndex = Math.floor(Math.random() * availableTimes.length);
              bookedTimes.push(availableTimes[randomIndex]);
              availableTimes.splice(randomIndex, 1);
            }
          } 
          // Saturday: Fewer slots
          else if (date.getDay() === 6) {
            availableTimes.push("09:00 AM", "10:00 AM", "11:00 AM");
            
            // Randomly mark some times as booked
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

  // Returns available times for a selected date
  const getAvailableTimesForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    const dateString = format(date, 'yyyy-MM-dd');
    const dateData = bookingData.find(d => d.date === dateString);
    
    return dateData?.availableTimes || [];
  };
  
  const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

  // Custom calendar day rendering to show availability
  const dayClassName = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dateData = bookingData.find(d => d.date === dateString);
    
    if (!dateData) return ""; // No data for this date
    
    // Highlight dates with availability differently
    if (dateData.availableTimes.length > 0) {
      return "bg-medical-primary/10 text-medical-primary font-medium dark:bg-medical-accent/10 dark:text-medical-accent";
    }
    
    return ""; // Default styling
  };
  
  // Disable past dates and Sundays
  const disabledDays = (date: Date) => {
    return isPast(date) || date.getDay() === 0;
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Calendar Section */}
        <div className="flex flex-col w-full md:w-auto items-center">
          <h3 className="text-lg font-medium mb-4 dark:text-medical-dark-text-primary self-start">Select a Date</h3>
          <div className="w-full flex justify-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[280px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={onDateSelect}
                  disabled={disabledDays}
                  fromDate={new Date()}
                  toDate={addDays(new Date(), 30)}
                  className="rounded-md border dark:border-gray-700 pointer-events-auto"
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
                  styles={{
                    day: (date) => {
                      return {
                        className: dayClassName(date)
                      };
                    }
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-3 mt-4 text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary self-start">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-medical-primary dark:bg-medical-accent mr-1"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600 mr-1"></div>
              <span>No slots</span>
            </div>
          </div>
        </div>
        
        {/* Time Slots Section */}
        <div className="w-full md:flex-1">
          <h3 className="text-lg font-medium mb-4 dark:text-medical-dark-text-primary">Select a Time</h3>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse flex flex-col items-center">
                <Clock className="h-8 w-8 text-medical-primary dark:text-medical-accent mb-2" />
                <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary">
                  Loading available times...
                </p>
              </div>
            </div>
          ) : selectedDate ? (
            availableTimes.length > 0 ? (
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
              <div className="flex flex-col items-center justify-center h-40 border border-dashed border-medical-neutral-300 dark:border-medical-dark-border rounded-lg">
                <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary text-center">
                  No available time slots for {format(selectedDate, 'PPP')}.
                </p>
                <p className="text-medical-neutral-500 dark:text-medical-dark-text-secondary text-center mt-1">
                  Please select a different date.
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-medical-neutral-300 dark:border-medical-dark-border rounded-lg">
              <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                Please select a date to see available time slots.
              </p>
            </div>
          )}
          
          {selectedDate && selectedTime && (
            <div className="mt-6 p-4 bg-medical-bg-light dark:bg-medical-dark-surface/30 rounded-lg">
              <h4 className="font-medium text-medical-primary dark:text-medical-accent mb-2">Your Selection</h4>
              <p className="text-medical-neutral-600 dark:text-medical-dark-text-primary">
                {format(selectedDate, 'PPP')} at {selectedTime}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-medical-primary/10 text-medical-primary border-medical-primary/30 dark:bg-medical-accent/10 dark:text-medical-accent dark:border-medical-accent/30">
                  Add to Google Calendar
                </Badge>
                <Badge variant="outline" className="bg-medical-primary/10 text-medical-primary border-medical-primary/30 dark:bg-medical-accent/10 dark:text-medical-accent dark:border-medical-accent/30">
                  Add to Apple Calendar
                </Badge>
                <Badge variant="outline" className="bg-medical-primary/10 text-medical-primary border-medical-primary/30 dark:bg-medical-accent/10 dark:text-medical-accent dark:border-medical-accent/30">
                  Add to Outlook
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
