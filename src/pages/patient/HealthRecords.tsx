import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { usePatientMedicalRecords } from '@/hooks/usePatients';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Pill,
  Activity,
  Heart,
  Eye,
  Share,
  Lock,
} from 'lucide-react';
import { InlineLoader, ErrorState, EmptyState } from '@/components/LoadingStates';

const HealthRecords: React.FC = () => {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: medicalRecords, isLoading, error } = usePatientMedicalRecords();

  if (isLoading) {
    return <InlineLoader message="Loading your health records..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to Load Records"
        message="We're having trouble loading your health records. Please try again."
      />
    );
  }

  const records = medicalRecords || [];

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
                {record.diagnosis || record.title || 'Medical Record'}
              </div>
              <Badge className={getRecordTypeColor(record.type || 'consultation')}>
                {getRecordTypeIcon(record.type || 'consultation')}
                <span className="ml-1 capitalize">{record.type || 'Consultation'}</span>
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(record.createdAt), 'MMMM d, yyyy')}
              </div>
              
              {record.provider && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {record.provider.user?.name || record.provider.name}
                </div>
              )}
              
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
                  <strong>Notes:</strong> {record.notes.substring(0, 100)}
                  {record.notes.length > 100 && '...'}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const filteredRecords = records.filter(record => 
    !searchTerm || 
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.treatment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.provider?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const recordsByType = {
    all: filteredRecords,
    consultation: filteredRecords.filter(r => r.type === 'consultation' || !r.type),
    prescription: filteredRecords.filter(r => r.type === 'prescription'),
    lab_result: filteredRecords.filter(r => r.type === 'lab_result'),
    imaging: filteredRecords.filter(r => r.type === 'imaging'),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Records</h1>
          <p className="text-muted-foreground">
            Your complete medical history and documents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
          <Button variant="outline">
            <Share className="h-4 w-4 mr-2" />
            Share Records
          </Button>
        </div>
      </div>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Lock className="h-4 w-4" />
            <span className="font-medium">Your records are secure and private</span>
          </div>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            All medical records are encrypted and only accessible to you and your authorized healthcare providers.
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
            {typeRecords.length > 0 ? (
              <div className="space-y-4">
                {typeRecords.map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))}
              </div>
            ) : (
              <EmptyState
                title={`No ${type === 'all' ? '' : type.replace('_', ' ')} Records`}
                message={`You don't have any ${type === 'all' ? '' : type.replace('_', ' ')} records yet.`}
                icon={<FileText className="h-12 w-12 text-muted-foreground" />}
              />
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default HealthRecords;
