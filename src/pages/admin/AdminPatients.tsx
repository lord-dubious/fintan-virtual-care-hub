
import React, { useState, useMemo } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, MoreHorizontal, ChevronRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePatients, usePatientMedicalHistory, usePatientAppointments } from '@/hooks/usePatients';
import { PatientFilters } from '@/api/patients';

// Type definitions for API data
interface ApiPatient {
  id: string;
  user: {
    name?: string;
    email?: string;
    phone?: string;
  };
  appointments?: ApiAppointment[];
}

interface ApiAppointment {
  id: string;
  appointmentDate: string;
  consultationType: 'VIDEO' | 'AUDIO' | string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | string;
}

interface ApiMedicalRecord {
  id: string;
  date: string;
  type: string;
  notes: string;
  diagnosis?: string;
  prescription?: string;
}

interface PatientUI {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  status: string;
}

// Transform API patient data to match UI expectations
const transformPatient = (patient: ApiPatient): PatientUI => {
  // Find the most recent appointment for last visit
  const lastAppointment = patient.appointments?.length > 0
    ? [...patient.appointments].sort((a, b) =>
        new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
      )[0]
    : null;

  return {
    id: patient.id,
    name: patient.user.name || 'Unknown Patient',
    email: patient.user.email || '',
    phone: patient.user.phone || '',
    lastVisit: lastAppointment
      ? new Date(lastAppointment.appointmentDate).toISOString().split('T')[0]
      : 'Never',
    status: 'Active' // You can add status logic based on your business rules
  };
};

const PatientDetails = ({ patient }: { patient: PatientUI }) => {
  const { toast } = useToast();

  // Fetch real medical history and appointments
  const { data: medicalHistory, isLoading: historyLoading } = usePatientMedicalHistory(patient.id);
  const { data: appointments, isLoading: appointmentsLoading } = usePatientAppointments(patient.id);

  // Transform medical history for display
  const transformedHistory = useMemo(() => {
    if (!medicalHistory) return [];
    return medicalHistory.map((record: ApiMedicalRecord) => ({
      date: new Date(record.date).toISOString().split('T')[0],
      type: record.type,
      notes: record.notes
    }));
  }, [medicalHistory]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const totalConsultations = appointments?.length || 0;
    const firstVisit = appointments?.length > 0
      ? [...appointments].sort((a, b) =>
          new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
        )[0]
      : null;
    const lastVisit = appointments?.length > 0
      ? [...appointments].sort((a, b) =>
          new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
        )[0]
      : null;

    return {
      totalConsultations,
      firstVisit: firstVisit ? new Date(firstVisit.appointmentDate).toLocaleDateString() : 'N/A',
      lastVisit: lastVisit ? new Date(lastVisit.appointmentDate).toLocaleDateString() : 'N/A',
      nextAppointment: 'Not scheduled' // You can implement logic for upcoming appointments
    };
  }, [appointments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">{patient.name}</h2>
          <p className="text-muted-foreground">Patient ID: {patient.id}</p>
        </div>
        <Button 
          onClick={() => toast({ 
            title: "Demo Only", 
            description: "This would allow editing patient information" 
          })}
        >
          Edit Patient
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{patient.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone:</span>
                <span>{patient.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${patient.status === 'Active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'}`}
                >
                  {patient.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Visit:</span>
                <span>
                  {patient.lastVisit === 'Never'
                    ? 'Never'
                    : new Date(patient.lastVisit).toLocaleDateString()
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Patient Summary</h3>
            <div className="space-y-2">
              {appointmentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Consultations:</span>
                    <span>{summaryStats.totalConsultations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">First Visit:</span>
                    <span>{summaryStats.firstVisit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Visit:</span>
                    <span>{summaryStats.lastVisit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next Appointment:</span>
                    <span>{summaryStats.nextAppointment}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Medical History</h3>
          <div className="space-y-4">
            {historyLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                    <Skeleton className="h-8 w-12" />
                  </div>
                </div>
              ))
            ) : transformedHistory.length > 0 ? (
              transformedHistory.map((record, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{new Date(record.date).toLocaleDateString()} - {record.type}</p>
                      <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8"
                      onClick={() => toast({
                        title: "View Record",
                        description: "This would show full medical record details"
                      })}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No medical history available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminPatients = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientUI | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Build filters for API
  const filters = useMemo((): PatientFilters => {
    const apiFilters: PatientFilters = {};

    if (searchTerm) {
      apiFilters.search = searchTerm;
    }

    return apiFilters;
  }, [searchTerm]);

  // Fetch patients with filters
  const { data: patients, isLoading, error } = usePatients(filters);

  // Transform patients for UI
  const transformedPatients = useMemo(() => {
    if (!patients) return [];
    return patients.map(transformPatient);
  }, [patients]);

  const resetFilters = () => {
    setSearchTerm('');
  };

  const handleViewPatient = (patient: PatientUI) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  };

  const handleActionClick = (action: string, patientId: string) => {
    toast({
      title: `${action} Patient`,
      description: `Action "${action}" for patient ${patientId}`,
    });
  };

  const PatientCard = ({ patient }: { patient: PatientUI }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{patient.name}</h3>
            <p className="text-sm text-muted-foreground">{patient.id}</p>
            <p className="text-sm mt-2">{patient.email}</p>
            <p className="text-sm">{patient.phone}</p>
            <div className={`inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium
              ${patient.status === 'Active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'}`}
            >
              {patient.status}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={() => handleViewPatient(patient)}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Patients</h1>
          <Button onClick={() => toast({ title: "Demo Only", description: "This would open the patient registration form" })}>
            Add Patient
          </Button>
        </div>

        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-4 mb-6`}>
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="ghost" onClick={resetFilters}>
            <Filter className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>

        {isMobile ? (
          <div className="space-y-3">
            {isLoading ? (
              // Loading skeletons for mobile
              Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="mb-3">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-28" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : error ? (
              <div className="text-center py-8 text-muted-foreground">
                Failed to load patients. Please try again.
              </div>
            ) : transformedPatients.length > 0 ? (
              transformedPatients.map(patient => (
                <PatientCard key={patient.id} patient={patient} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No patients found matching your search.
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Last Visit</TableHead>
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
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Failed to load patients. Please try again.
                    </TableCell>
                  </TableRow>
                ) : transformedPatients.length > 0 ? (
                  transformedPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.id}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>
                        {patient.lastVisit === 'Never'
                          ? 'Never'
                          : new Date(patient.lastVisit).toLocaleDateString()
                        }
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${patient.status === 'Active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'}`}
                        >
                          {patient.status}
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
                            <DropdownMenuItem onClick={() => handleViewPatient(patient)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActionClick("Edit", patient.id)}>
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActionClick("Book", patient.id)}>
                              Book Appointment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No patients found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Comprehensive view of the patient's information and medical history.
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && <PatientDetails patient={selectedPatient} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPatients;
