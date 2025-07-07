import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Stethoscope,
  Pill,
  TestTube,
  Heart,
  Activity,
  Eye,
  Plus
} from 'lucide-react';

interface MedicalRecord {
  id: string;
  date: Date;
  type: 'consultation' | 'lab_result' | 'prescription' | 'note' | 'imaging';
  title: string;
  provider: string;
  content: string;
  attachments?: string[];
  status?: 'active' | 'completed' | 'pending';
}

interface MedicalRecordsProps {
  records: MedicalRecord[];
  isLoading?: boolean;
}

const MedicalRecords: React.FC<MedicalRecordsProps> = ({ records, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'type'>('date');

  // Filter and sort records
  const filteredRecords = records
    .filter(record => {
      const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || record.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.type.localeCompare(b.type);
    });

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'consultation':
        return <Stethoscope className="h-5 w-5" />;
      case 'lab_result':
        return <TestTube className="h-5 w-5" />;
      case 'prescription':
        return <Pill className="h-5 w-5" />;
      case 'imaging':
        return <Activity className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'consultation':
        return 'text-blue-600';
      case 'lab_result':
        return 'text-green-600';
      case 'prescription':
        return 'text-purple-600';
      case 'imaging':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    const variants = {
      active: 'default',
      completed: 'secondary',
      pending: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Medical Records</h2>
          <p className="text-gray-600 dark:text-gray-400">Your complete medical history</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Request Records
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="consultation">Consultations</SelectItem>
                <SelectItem value="lab_result">Lab Results</SelectItem>
                <SelectItem value="prescription">Prescriptions</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="note">Notes</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'type')}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No records found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Your medical records will appear here as they become available'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getRecordColor(record.type)}`}>
                      {getRecordIcon(record.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {record.title}
                        </h3>
                        {getStatusBadge(record.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(record.date, 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {record.provider}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2">
                        {record.content}
                      </p>
                      {record.attachments && record.attachments.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {record.attachments.length} attachment{record.attachments.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Records Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {records.filter(r => r.type === 'consultation').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Consultations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {records.filter(r => r.type === 'lab_result').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lab Results</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {records.filter(r => r.type === 'prescription').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Prescriptions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {records.filter(r => r.type === 'imaging').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Imaging</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicalRecords;
