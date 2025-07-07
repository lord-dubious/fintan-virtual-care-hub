import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Calendar,
  User,
  Download,
  Share,
  Edit,
  Trash2,
  Upload,
  Eye,
  Lock,
  Pill,
  Activity,
  Heart,
  Brain,
} from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InlineLoader, EmptyState } from '@/components/LoadingStates';

const DoctorMedicalRecords: React.FC = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading] = useState(false);

  // Mock data - in real app this would come from API
  const medicalRecords = [
    {
      id: '1',
      patient: {
        id: 'p1',
        user: { name: 'Sarah Johnson' },
      },
      type: 'consultation',
      diagnosis: 'Hypertension',
      treatment: 'Prescribed Lisinopril 10mg daily',
      prescription: 'Lisinopril 10mg - Take once daily with food',
      notes: 'Patient reports feeling dizzy occasionally. Blood pressure readings have been elevated. Recommended lifestyle changes including reduced sodium intake and regular exercise.',
      createdAt: '2025-07-05T10:00:00Z',
      attachments: ['blood_pressure_chart.pdf'],
      status: 'active',
    },
    {
      id: '2',
      patient: {
        id: 'p2',
        user: { name: 'Michael Chen' },
      },
      type: 'lab_result',
      diagnosis: 'Annual Physical - Normal Results',
      treatment: 'Continue current health regimen',
      prescription: null,
      notes: 'All lab values within normal ranges. Patient is in good health. Recommended annual follow-up.',
      createdAt: '2025-07-03T15:30:00Z',
      attachments: ['lab_results_2025.pdf', 'chest_xray.jpg'],
      status: 'completed',
    },
    {
      id: '3',
      patient: {
        id: 'p3',
        user: { name: 'Emily Rodriguez' },
      },
      type: 'prescription',
      diagnosis: 'Seasonal Allergies',
      treatment: 'Antihistamine therapy',
      prescription: 'Cetirizine 10mg - Take once daily as needed for allergies',
      notes: 'Patient experiencing seasonal allergy symptoms. Prescribed antihistamine for symptom relief.',
      createdAt: '2025-06-28T09:15:00Z',
      attachments: [],
      status: 'active',
    },
  ];

  const getRecordTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'consultation':
        return <User className="h-4 w-4" />;
      case 'prescription':
        return <Pill className="h-4 w-4" />;
      case 'lab_result':
        return <Activity className="h-4 w-4" />;
      case 'imaging':
        return <Eye className="h-4 w-4" />;
      case 'surgery':
        return <Heart className="h-4 w-4" />;
      case 'mental_health':
        return <Brain className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'consultation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'prescription':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'lab_result':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'imaging':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'surgery':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'mental_health':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const RecordCard: React.FC<{ record: any }> = ({ record }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="font-semibold text-lg">
                {record.diagnosis}
              </div>
              <Badge className={getRecordTypeColor(record.type)}>
                {getRecordTypeIcon(record.type)}
                <span className="ml-1 capitalize">{record.type.replace('_', ' ')}</span>
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient: {record.patient.user.name}
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(record.createdAt), 'MMMM d, yyyy h:mm a')}
              </div>
              
              {record.treatment && (
                <div className="text-sm">
                  <strong>Treatment:</strong> {record.treatment}
                </div>
              )}
              
              {record.prescription && (
                <div className="text-sm">
                  <strong>Prescription:</strong> {record.prescription}
                </div>
              )}
              
              {record.notes && (
                <div className="text-sm">
                  <strong>Notes:</strong> {record.notes.substring(0, 150)}
                  {record.notes.length > 150 && '...'}
                </div>
              )}
              
              {record.attachments.length > 0 && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {record.attachments.length} attachment(s)
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CreateRecordDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Medical Record</DialogTitle>
          <DialogDescription>
            Add a new medical record for a patient
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="p1">Sarah Johnson</SelectItem>
                  <SelectItem value="p2">Michael Chen</SelectItem>
                  <SelectItem value="p3">Emily Rodriguez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Record Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="lab_result">Lab Result</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="surgery">Surgery</SelectItem>
                  <SelectItem value="mental_health">Mental Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnosis</Label>
            <Input id="diagnosis" placeholder="Enter diagnosis" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="treatment">Treatment</Label>
            <Textarea id="treatment" placeholder="Describe treatment plan" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prescription">Prescription (if applicable)</Label>
            <Textarea id="prescription" placeholder="Enter prescription details" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea id="notes" placeholder="Enter detailed clinical notes" rows={4} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                Drag and drop files here, or click to browse
              </p>
              <Button variant="outline" className="mt-2">
                Choose Files
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(false)}>
            Create Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const filteredRecords = medicalRecords.filter(record => 
    !searchTerm || 
    record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patient.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recordsByType = {
    all: filteredRecords,
    consultation: filteredRecords.filter(r => r.type === 'consultation'),
    prescription: filteredRecords.filter(r => r.type === 'prescription'),
    lab_result: filteredRecords.filter(r => r.type === 'lab_result'),
    imaging: filteredRecords.filter(r => r.type === 'imaging'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">
            Create and manage patient medical records
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Record
            </Button>
          </DialogTrigger>
          <CreateRecordDialog />
        </Dialog>
      </div>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Lock className="h-4 w-4" />
            <span className="font-medium">HIPAA Compliant & Secure</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            All medical records are encrypted and comply with healthcare privacy regulations.
          </p>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Records Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-5'}`}>
          <TabsTrigger value="all">
            All ({recordsByType.all.length})
          </TabsTrigger>
          <TabsTrigger value="consultation">
            Consultations ({recordsByType.consultation.length})
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="prescription">
                Prescriptions ({recordsByType.prescription.length})
              </TabsTrigger>
              <TabsTrigger value="lab_result">
                Lab Results ({recordsByType.lab_result.length})
              </TabsTrigger>
              <TabsTrigger value="imaging">
                Imaging ({recordsByType.imaging.length})
              </TabsTrigger>
            </>
          )}
          {isMobile && (
            <TabsTrigger value="other">
              Other
            </TabsTrigger>
          )}
        </TabsList>

        {Object.entries(recordsByType).map(([type, typeRecords]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {isLoading ? (
              <InlineLoader message="Loading medical records..." />
            ) : typeRecords.length > 0 ? (
              <div className="space-y-4">
                {typeRecords.map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={`No ${type === 'all' ? '' : type.replace('_', ' ')} Records`}
                message={`No ${type === 'all' ? '' : type.replace('_', ' ')} records found.`}
                action={{
                  label: "Create New Record",
                  onClick: () => setIsCreateDialogOpen(true)
                }}
                icon={<FileText className="h-12 w-12 text-muted-foreground" />}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default DoctorMedicalRecords;
