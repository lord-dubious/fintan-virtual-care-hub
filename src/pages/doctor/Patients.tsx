import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import {
  Users,
  Search,
  Filter,
  Calendar,
  FileText,
  MessageSquare,
  Phone,
  Mail,
  MoreVertical,
  Eye,
  Plus,
  Activity,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { InlineLoader, EmptyState } from '@/components/LoadingStates';

const DoctorPatients: React.FC = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading] = useState(false);

  // Mock data - in real app this would come from API
  const patients = [
    {
      id: '1',
      user: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
      },
      dateOfBirth: '1985-03-15',
      lastVisit: '2025-07-05T10:00:00Z',
      nextAppointment: '2025-07-10T14:00:00Z',
      totalAppointments: 12,
      medicalRecords: 8,
      status: 'active',
      conditions: ['Hypertension', 'Diabetes Type 2'],
    },
    {
      id: '2',
      user: {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 987-6543',
      },
      dateOfBirth: '1978-11-22',
      lastVisit: '2025-07-03T15:30:00Z',
      nextAppointment: null,
      totalAppointments: 5,
      medicalRecords: 3,
      status: 'active',
      conditions: ['Asthma'],
    },
    {
      id: '3',
      user: {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@email.com',
        phone: '+1 (555) 456-7890',
      },
      dateOfBirth: '1992-07-08',
      lastVisit: '2025-06-28T09:15:00Z',
      nextAppointment: '2025-07-12T11:00:00Z',
      totalAppointments: 3,
      medicalRecords: 2,
      status: 'new',
      conditions: [],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const PatientCard: React.FC<{ patient: any }> = ({ patient }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="font-semibold text-lg">
                  {patient.user.name}
                </div>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status}
                </Badge>
              </div>
              
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {patient.user.email}
                </div>
                
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {patient.user.phone}
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Age: {calculateAge(patient.dateOfBirth)} years
                </div>
                
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Last visit: {patient.lastVisit ? 
                    format(new Date(patient.lastVisit), 'MMM d, yyyy') : 
                    'No previous visits'
                  }
                </div>
                
                {patient.nextAppointment && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Next: {format(new Date(patient.nextAppointment), 'MMM d, yyyy h:mm a')}
                  </div>
                )}
                
                {patient.conditions.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <FileText className="h-4 w-4" />
                    <div className="flex flex-wrap gap-1">
                      {patient.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 mt-3 text-sm">
                <span className="text-muted-foreground">
                  {patient.totalAppointments} appointments
                </span>
                <span className="text-muted-foreground">
                  {patient.medicalRecords} records
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Records
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Add Medical Record
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Patient
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filteredPatients = patients.filter(patient => 
    !searchTerm || 
    patient.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.conditions.some(condition => 
      condition.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patient list and medical records
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4`}>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {patients.length}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Patients
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {patients.filter(p => p.status === 'active').length}
            </div>
            <div className="text-sm text-muted-foreground">
              Active Patients
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Plus className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {patients.filter(p => p.status === 'new').length}
            </div>
            <div className="text-sm text-muted-foreground">
              New Patients
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {patients.filter(p => p.nextAppointment).length}
            </div>
            <div className="text-sm text-muted-foreground">
              Scheduled
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Patients List */}
      {isLoading ? (
        <InlineLoader message="Loading patients..." />
      ) : filteredPatients.length > 0 ? (
        <div className="space-y-4">
          {filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Patients Found"
          message={searchTerm ? 
            "No patients match your search criteria." : 
            "You don't have any patients yet."
          }
          action={!searchTerm ? {
            label: "Add Your First Patient",
            onClick: () => console.log('Add patient')
          } : undefined}
          icon={<Users className="h-12 w-12 text-muted-foreground" />}
        />
      )}
    </div>
  );
};

export default DoctorPatients;
