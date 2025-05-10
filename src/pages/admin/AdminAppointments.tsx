
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar as CalendarIcon, 
  Search, 
  Filter, 
  ChevronDown,
  MoreHorizontal,
  Video,
  Phone
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';

// Mock appointment data
const APPOINTMENTS = [
  { 
    id: 'APP001', 
    patient: 'John Doe', 
    date: '2025-05-11T10:00:00', 
    type: 'Video', 
    status: 'Confirmed' 
  },
  { 
    id: 'APP002', 
    patient: 'Jane Smith', 
    date: '2025-05-11T11:30:00', 
    type: 'Audio', 
    status: 'Confirmed' 
  },
  { 
    id: 'APP003', 
    patient: 'Robert Johnson', 
    date: '2025-05-11T14:00:00', 
    type: 'Video', 
    status: 'Confirmed' 
  },
  { 
    id: 'APP004', 
    patient: 'Emily Williams', 
    date: '2025-05-12T09:15:00', 
    type: 'Audio', 
    status: 'Confirmed' 
  },
  { 
    id: 'APP005', 
    patient: 'Michael Brown', 
    date: '2025-05-12T13:45:00', 
    type: 'Video', 
    status: 'Cancelled' 
  },
  { 
    id: 'APP006', 
    patient: 'Sarah Davis', 
    date: '2025-05-13T10:30:00', 
    type: 'Video', 
    status: 'Confirmed' 
  },
  { 
    id: 'APP007', 
    patient: 'David Miller', 
    date: '2025-05-13T15:15:00', 
    type: 'Audio', 
    status: 'Confirmed' 
  },
];

const AdminAppointments = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [filteredAppointments, setFilteredAppointments] = useState(APPOINTMENTS);

  // Apply filters
  React.useEffect(() => {
    let results = [...APPOINTMENTS];
    
    if (searchTerm) {
      results = results.filter(app => 
        app.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      results = results.filter(app => app.date.startsWith(dateStr));
    }
    
    setFilteredAppointments(results);
  }, [searchTerm, selectedDate]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDate(undefined);
    setFilteredAppointments(APPOINTMENTS);
  };

  const handleActionClick = (action: string, appointmentId: string) => {
    toast({
      title: `${action} Appointment`,
      description: `Action "${action}" for appointment ${appointmentId} (Demo only)`,
    });
  };

  // Format the appointment date
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const AppointmentCard = ({ appointment }: { appointment: typeof APPOINTMENTS[0] }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{appointment.patient}</h3>
            <p className="text-sm text-muted-foreground">{appointment.id}</p>
            <div className="flex items-center gap-1 mt-1">
              {appointment.type === 'Video' ? (
                <Video className="h-3 w-3" />
              ) : (
                <Phone className="h-3 w-3" />
              )}
              <span className="text-sm">{appointment.type}</span>
            </div>
            <p className="text-sm mt-2">{formatAppointmentDate(appointment.date)}</p>
            <div className={`inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium
              ${appointment.status === 'Confirmed' 
                ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'}`}
            >
              {appointment.status}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleActionClick("View", appointment.id)}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleActionClick("Reschedule", appointment.id)}>
                Reschedule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleActionClick("Cancel", appointment.id)}>
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <Button onClick={() => toast({ title: "Demo Only", description: "This would open the appointment creation form" })}>
          New Appointment
        </Button>
      </div>

      <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 mb-6`}>
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </PopoverContent>
          </Popover>
          <Button variant="ghost" onClick={resetFilters}>
            <Filter className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {filteredAppointments.length > 0 ? (
            filteredAppointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No appointments found for the selected filters.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">{appointment.id}</TableCell>
                    <TableCell>{appointment.patient}</TableCell>
                    <TableCell>{formatAppointmentDate(appointment.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {appointment.type === 'Video' ? (
                          <Video className="h-4 w-4 mr-1" />
                        ) : (
                          <Phone className="h-4 w-4 mr-1" />
                        )}
                        {appointment.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${appointment.status === 'Confirmed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400'}`}
                      >
                        {appointment.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleActionClick("View", appointment.id)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleActionClick("Reschedule", appointment.id)}>
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleActionClick("Cancel", appointment.id)}>
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No appointments found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminAppointments;
