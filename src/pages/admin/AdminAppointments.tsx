import React from "react";
import { useState, useMemo } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
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
import { useAdminAppointments } from '@/hooks/useAdmin';
import { useCancelAppointment, useJoinConsultation } from '@/hooks/useAppointments';
import { AppointmentFilters, ApiAppointment } from '@/api/appointments'; // Import ApiAppointment

// Define UI-specific AppointmentUI based on ApiAppointment
interface AppointmentUI {
  id: string;
  patient: string;
  date: string;
  type: string;
  status: string;
}

// Transform API appointment data to match UI expectations
const transformAppointment = (appointment: ApiAppointment): AppointmentUI => ({
  id: appointment.id,
  patient: appointment.patient?.user?.name || 'Unknown Patient', // Access patient name via user object
  date: appointment.appointmentDate.toISOString(), // Convert Date to ISO string
  type: appointment.consultationType === 'VIDEO' ? 'Video' : 'Audio',
  status: appointment.status === 'SCHEDULED' ? 'Confirmed' :
          appointment.status === 'CONFIRMED' ? 'Confirmed' :
          appointment.status === 'IN_PROGRESS' ? 'In Progress' :
          appointment.status === 'COMPLETED' ? 'Completed' :
          appointment.status === 'CANCELLED' ? 'Cancelled' : appointment.status
});

const AdminAppointments = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Mutations
  const cancelAppointment = useCancelAppointment();
  const joinConsultation = useJoinConsultation();

  // Build filters for API
  const filters = useMemo((): AppointmentFilters => {
    const apiFilters: AppointmentFilters = {};

    if (searchTerm) {
      apiFilters.search = searchTerm;
    }

    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      apiFilters.dateFrom = startOfDay;
      apiFilters.dateTo = endOfDay;
    }

    return apiFilters;
  }, [searchTerm, selectedDate]);

  // Fetch appointments with filters
  const { data: appointmentsData, isLoading, error } = useAdminAppointments(filters);

  // Transform appointments for UI
  const transformedAppointments = useMemo(() => {
    if (!appointmentsData?.appointments) return [];
    return appointmentsData.appointments.map(transformAppointment);
  }, [appointmentsData]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedDate(undefined);
  };

  const handleActionClick = async (action: string, appointmentId: string) => {
    try {
      switch (action) {
        case 'View':
          // Navigate to appointment details (implement as needed)
          toast({
            title: "View Appointment",
            description: `Viewing details for appointment ${appointmentId}`,
          });
          break;
        case 'Reschedule':
          // For demo, just show success message
          // In real implementation, open reschedule dialog
          toast({
            title: "Reschedule Appointment",
            description: "Reschedule functionality would open here",
          });
          break;
        case 'Cancel':
          await cancelAppointment.mutateAsync({ id: appointmentId, reason: 'Cancelled by admin' });
          break;
        case 'Join':
          await joinConsultation.mutateAsync(appointmentId);
          break;
        default:
          toast({
            title: `${action} Appointment`,
            description: `Action "${action}" for appointment ${appointmentId}`,
          });
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  // Format the appointment date
  const formatAppointmentDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const AppointmentCard = ({ appointment }: { appointment: AppointmentUI }) => (
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
          {isLoading ? (
            // Loading skeletons for mobile
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="mb-3">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              Failed to load appointments. Please try again.
            </div>
          ) : transformedAppointments.length > 0 ? (
            transformedAppointments.map(appointment => (
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
              {isLoading ? (
                // Loading skeletons for table
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Failed to load appointments. Please try again.
                  </TableCell>
                </TableRow>
              ) : transformedAppointments.length > 0 ? (
                transformedAppointments.map((appointment) => (
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
                        ${appointment.status === 'Confirmed' || appointment.status === 'Scheduled'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                          : appointment.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400'
                          : appointment.status === 'Completed'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400'
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
