
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
import { Card, CardContent } from '@/components/ui/card';
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

// Mock patient data
const PATIENTS = [
  { 
    id: 'PAT001', 
    name: 'John Doe', 
    email: 'john.doe@example.com', 
    phone: '(555) 123-4567', 
    lastVisit: '2025-05-02', 
    status: 'Active' 
  },
  { 
    id: 'PAT002', 
    name: 'Jane Smith', 
    email: 'jane.smith@example.com', 
    phone: '(555) 234-5678', 
    lastVisit: '2025-05-05', 
    status: 'Active' 
  },
  { 
    id: 'PAT003', 
    name: 'Robert Johnson', 
    email: 'robert.johnson@example.com', 
    phone: '(555) 345-6789', 
    lastVisit: '2025-04-28', 
    status: 'Active' 
  },
  { 
    id: 'PAT004', 
    name: 'Emily Williams', 
    email: 'emily.williams@example.com', 
    phone: '(555) 456-7890', 
    lastVisit: '2025-04-20', 
    status: 'Inactive' 
  },
  { 
    id: 'PAT005', 
    name: 'Michael Brown', 
    email: 'michael.brown@example.com', 
    phone: '(555) 567-8901', 
    lastVisit: '2025-04-15', 
    status: 'Active' 
  },
  { 
    id: 'PAT006', 
    name: 'Sarah Davis', 
    email: 'sarah.davis@example.com', 
    phone: '(555) 678-9012', 
    lastVisit: '2025-03-30', 
    status: 'Active' 
  },
];

const PatientDetails = ({ patient }: { patient: typeof PATIENTS[0] }) => {
  const { toast } = useToast();
  
  // Mock medical history
  const medicalHistory = [
    { date: '2025-05-02', type: 'Video Consultation', notes: 'Regular checkup, prescribed medication for allergies.' },
    { date: '2025-04-10', type: 'Audio Consultation', notes: 'Follow-up on previous treatment, showing improvement.' },
    { date: '2025-03-15', type: 'Video Consultation', notes: 'Initial consultation regarding seasonal allergies.' },
  ];

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
                <span>{new Date(patient.lastVisit).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-4">Patient Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Consultations:</span>
                <span>3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">First Visit:</span>
                <span>Mar 15, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Visit:</span>
                <span>May 2, 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Next Appointment:</span>
                <span>Not scheduled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-4">Medical History</h3>
          <div className="space-y-4">
            {medicalHistory.map((record, index) => (
              <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{new Date(record.date).toLocaleDateString()} - {record.type}</p>
                    <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8" 
                    onClick={() => toast({ 
                      title: "Demo Only", 
                      description: "This would show full consultation details" 
                    })}
                  >
                    View
                  </Button>
                </div>
              </div>
            ))}
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
  const [filteredPatients, setFilteredPatients] = useState(PATIENTS);
  const [selectedPatient, setSelectedPatient] = useState<typeof PATIENTS[0] | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Apply filters
  React.useEffect(() => {
    if (!searchTerm) {
      setFilteredPatients(PATIENTS);
      return;
    }
    
    const results = PATIENTS.filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredPatients(results);
  }, [searchTerm]);

  const resetFilters = () => {
    setSearchTerm('');
    setFilteredPatients(PATIENTS);
  };

  const handleViewPatient = (patient: typeof PATIENTS[0]) => {
    setSelectedPatient(patient);
    setShowDetails(true);
  };

  const handleActionClick = (action: string, patientId: string) => {
    toast({
      title: `${action} Patient`,
      description: `Action "${action}" for patient ${patientId} (Demo only)`,
    });
  };

  const PatientCard = ({ patient }: { patient: typeof PATIENTS[0] }) => (
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
            {filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
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
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.id}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{new Date(patient.lastVisit).toLocaleDateString()}</TableCell>
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
