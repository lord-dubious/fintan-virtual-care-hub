import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import {
  Calendar,
  Plus,
  Trash2,
  Copy,
  Save,
  RotateCcw,
  AlertCircle,
  Coffee,
  Plane,
  Settings,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  breaks: TimeSlot[];
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface TimeOffPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: 'vacation' | 'sick' | 'conference' | 'personal';
  isRecurring: boolean;
  notes?: string;
}

const AvailabilitySettings: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('weekly');

  // Default schedule
  const defaultDaySchedule: DaySchedule = {
    isAvailable: true,
    timeSlots: [{ start: '09:00', end: '17:00' }],
    breaks: [{ start: '12:00', end: '13:00' }],
  };

  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: defaultDaySchedule,
    tuesday: defaultDaySchedule,
    wednesday: defaultDaySchedule,
    thursday: defaultDaySchedule,
    friday: defaultDaySchedule,
    saturday: { isAvailable: false, timeSlots: [], breaks: [] },
    sunday: { isAvailable: false, timeSlots: [], breaks: [] },
  });

  const [timeOffPeriods, setTimeOffPeriods] = useState<TimeOffPeriod[]>([
    {
      id: '1',
      title: 'Summer Vacation',
      startDate: '2025-08-15',
      endDate: '2025-08-25',
      type: 'vacation',
      isRecurring: false,
      notes: 'Annual family vacation',
    },
  ]);

  const [newTimeOff, setNewTimeOff] = useState({
    title: '',
    startDate: '',
    endDate: '',
    type: 'vacation' as 'vacation' | 'sick' | 'personal' | 'conference',
    isRecurring: false,
    notes: '',
  });

  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ] as const;

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  const updateDaySchedule = (day: keyof WeeklySchedule, updates: Partial<DaySchedule>) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], ...updates }
    }));
  };

  const addTimeSlot = (day: keyof WeeklySchedule) => {
    const daySchedule = weeklySchedule[day];
    const newSlot = { start: '09:00', end: '17:00' };
    updateDaySchedule(day, {
      timeSlots: [...daySchedule.timeSlots, newSlot]
    });
  };

  const removeTimeSlot = (day: keyof WeeklySchedule, index: number) => {
    const daySchedule = weeklySchedule[day];
    updateDaySchedule(day, {
      timeSlots: daySchedule.timeSlots.filter((_, i) => i !== index)
    });
  };

  const addBreak = (day: keyof WeeklySchedule) => {
    const daySchedule = weeklySchedule[day];
    const newBreak = { start: '12:00', end: '13:00' };
    updateDaySchedule(day, {
      breaks: [...daySchedule.breaks, newBreak]
    });
  };

  const removeBreak = (day: keyof WeeklySchedule, index: number) => {
    const daySchedule = weeklySchedule[day];
    updateDaySchedule(day, {
      breaks: daySchedule.breaks.filter((_, i) => i !== index)
    });
  };

  const copySchedule = (fromDay: keyof WeeklySchedule, toDay: keyof WeeklySchedule) => {
    const sourceSchedule = weeklySchedule[fromDay];
    updateDaySchedule(toDay, {
      isAvailable: sourceSchedule.isAvailable,
      timeSlots: [...sourceSchedule.timeSlots],
      breaks: [...sourceSchedule.breaks],
    });
    toast({
      title: "Schedule Copied",
      description: `${fromDay} schedule copied to ${toDay}`,
    });
  };

  const addTimeOff = () => {
    if (!newTimeOff.title || !newTimeOff.startDate || !newTimeOff.endDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const timeOff: TimeOffPeriod = {
      id: Date.now().toString(),
      ...newTimeOff,
    };

    setTimeOffPeriods(prev => [...prev, timeOff]);
    setNewTimeOff({
      title: '',
      startDate: '',
      endDate: '',
      type: 'vacation',
      isRecurring: false,
      notes: '',
    });
    setIsTimeOffDialogOpen(false);
    toast({
      title: "Time Off Added",
      description: "Your time off period has been scheduled",
    });
  };

  const removeTimeOff = (id: string) => {
    setTimeOffPeriods(prev => prev.filter(period => period.id !== id));
    toast({
      title: "Time Off Removed",
      description: "The time off period has been removed",
    });
  };

  const saveSchedule = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Schedule Saved",
        description: "Your availability has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vacation':
        return <Plane className="h-4 w-4" />;
      case 'sick':
        return <AlertCircle className="h-4 w-4" />;
      case 'conference':
        return <Settings className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'sick':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'conference':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const DayScheduleCard: React.FC<{ day: keyof WeeklySchedule }> = ({ day }) => {
    const daySchedule = weeklySchedule[day];
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);

    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{dayName}</CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={daySchedule.isAvailable}
                onCheckedChange={(checked) => updateDaySchedule(day, { isAvailable: checked })}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Copy className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {daysOfWeek.filter(d => d !== day).map(targetDay => (
                    <DropdownMenuItem
                      key={targetDay}
                      onClick={() => copySchedule(day, targetDay)}
                    >
                      Copy to {targetDay.charAt(0).toUpperCase() + targetDay.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        {daySchedule.isAvailable && (
          <CardContent className="space-y-4">
            {/* Working Hours */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Working Hours</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addTimeSlot(day)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Slot
                </Button>
              </div>
              <div className="space-y-2">
                {daySchedule.timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={slot.start}
                      onValueChange={(value) => {
                        const newSlots = [...daySchedule.timeSlots];
                        newSlots[index].start = value;
                        updateDaySchedule(day, { timeSlots: newSlots });
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">to</span>
                    <Select
                      value={slot.end}
                      onValueChange={(value) => {
                        const newSlots = [...daySchedule.timeSlots];
                        newSlots[index].end = value;
                        updateDaySchedule(day, { timeSlots: newSlots });
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {daySchedule.timeSlots.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTimeSlot(day, index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Breaks */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Breaks</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addBreak(day)}
                >
                  <Coffee className="h-3 w-3 mr-1" />
                  Add Break
                </Button>
              </div>
              <div className="space-y-2">
                {daySchedule.breaks.map((breakTime, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      value={breakTime.start}
                      onValueChange={(value) => {
                        const newBreaks = [...daySchedule.breaks];
                        newBreaks[index].start = value;
                        updateDaySchedule(day, { breaks: newBreaks });
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">to</span>
                    <Select
                      value={breakTime.end}
                      onValueChange={(value) => {
                        const newBreaks = [...daySchedule.breaks];
                        newBreaks[index].end = value;
                        updateDaySchedule(day, { breaks: newBreaks });
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBreak(day, index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Availability Settings</h1>
          <p className="text-muted-foreground">
            Manage your working hours, breaks, and time off
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <Button onClick={saveSchedule} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Weekly Schedule */}
        <TabsContent value="weekly" className="space-y-6">
          <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'} gap-4`}>
            {daysOfWeek.map(day => (
              <DayScheduleCard key={day} day={day} />
            ))}
          </div>
        </TabsContent>

        {/* Time Off */}
        <TabsContent value="timeoff" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Scheduled Time Off</h3>
            <Dialog open={isTimeOffDialogOpen} onOpenChange={setIsTimeOffDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time Off
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Time Off</DialogTitle>
                  <DialogDescription>
                    Block time in your calendar for vacation, conferences, or other commitments
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newTimeOff.title}
                      onChange={(e) => setNewTimeOff(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Summer Vacation"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newTimeOff.startDate}
                        onChange={(e) => setNewTimeOff(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newTimeOff.endDate}
                        onChange={(e) => setNewTimeOff(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newTimeOff.type}
                      onValueChange={(value: string) => setNewTimeOff(prev => ({ ...prev, type: value as 'vacation' | 'sick' | 'personal' | 'conference' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vacation">Vacation</SelectItem>
                        <SelectItem value="sick">Sick Leave</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={newTimeOff.notes}
                      onChange={(e) => setNewTimeOff(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional details"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsTimeOffDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addTimeOff}>
                    Add Time Off
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {timeOffPeriods.map((period) => (
              <Card key={period.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getTypeColor(period.type)}`}>
                        {getTypeIcon(period.type)}
                      </div>
                      <div>
                        <div className="font-semibold">{period.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(period.startDate), 'MMM d, yyyy')} - {format(new Date(period.endDate), 'MMM d, yyyy')}
                        </div>
                        {period.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {period.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(period.type)}>
                        {period.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTimeOff(period.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Schedule templates coming soon</p>
            <p className="text-sm">Save and reuse common schedule patterns</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AvailabilitySettings;
