import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePatientDashboard, usePatientMedicalRecords } from '@/hooks/usePatients';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Loader2, FileText, Calendar, User, Download } from 'lucide-react';
import { PatientWithUser, MedicalRecord, ProviderWithUser } from 'shared/domain'; // Import PatientWithUser and MedicalRecord, and ProviderWithUser

const PatientProfile = () => {
  const { data: patient, isLoading } = usePatientDashboard();
  const { user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  // Cast patient to PatientWithUser for correct type inference
  const patientData: PatientWithUser | undefined = patient;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Patient Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
                  {user?.name?.charAt(0) || '?'}
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Name</span>
                  <p className="font-medium">{user?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Email</span>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Phone</span>
                  <p className="font-medium">{patientData?.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</span>
                  <p className="font-medium">{patientData?.dateOfBirth ? format(patientData.dateOfBirth, 'MMMM d, yyyy') : 'Not provided'}</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-4">
                <User className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Allergies</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {patientData?.medicalHistory?.allergies?.length ? patientData.medicalHistory.allergies.join(', ') : 'No known allergies'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold">Current Medications</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {patientData?.medicalHistory?.medications?.length ? patientData.medicalHistory.medications.join(', ') : 'No current medications'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold">Medical History</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {patientData?.medicalHistory?.history || 'No medical history provided'}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold">Emergency Contact</h3>
                {patientData?.emergencyContact ? (
                  <div className="text-gray-600 dark:text-gray-400">
                    <p>{patientData.emergencyContact.name}</p>
                    <p>{patientData.emergencyContact.relationship}</p>
                    <p>{patientData.emergencyContact.phone}</p>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No emergency contact provided</p>
                )}
              </div>
              
              <Button className="mt-4">
                <User className="h-4 w-4 mr-2" /> Update Medical Information
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const PatientRecords = () => {
  const { data: medicalRecords, isLoading } = usePatientMedicalRecords();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Medical Records</h1>
        <Button>Request Records</Button>
      </div>
      
      {!medicalRecords?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Medical Records</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
              You don't have any medical records on file yet. Records will appear here after your consultations.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {medicalRecords.map((record: MedicalRecord) => { // Explicitly type record as MedicalRecord
            // Derive type and title based on record content
            let recordType: 'consultation' | 'lab_result' | 'prescription' | 'note' = 'note';
            let recordTitle: string = 'Medical Record';

            if (record.diagnosis) {
              recordType = 'consultation';
              recordTitle = record.diagnosis;
            } else if (record.prescriptions) {
              recordType = 'prescription';
              recordTitle = 'Prescription';
            }
            // Add more conditions for other types like 'lab_result' if applicable

            return (
              <Card key={record.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{recordType.charAt(0).toUpperCase() + recordType.slice(1)}: {recordTitle}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {format(record.createdAt, 'MMM d, yyyy')} {/* Use createdAt */}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{record.notes}</p>
                  {record.diagnosis && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-1">Diagnosis</h4>
                      <p className="text-gray-600 dark:text-gray-400">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.prescriptions && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-1">Prescription</h4>
                      {/* Assuming prescriptions is an object with instructions/dosage */}
                      <p className="text-gray-600 dark:text-gray-400">
                        {record.prescriptions.instructions || record.prescriptions.dosage || 'Details not provided'}
                      </p>
                    </div>
                  )}
                  {record.providerId && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Provider ID: {record.providerId} {/* Display providerId, or fetch name if needed */}
                    </div>
                  )}
                  {record.attachments && record.attachments.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Attachments</h4>
                      <div className="flex flex-wrap gap-3">
                        {record.attachments.map((attachment: string, idx: number) => ( // Explicitly type attachment and idx
                          <Button key={idx} variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" /> 
                            {attachment.split('/').pop() || `File ${idx+1}`}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

const PatientRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="profile" element={<PatientProfile />} />
      <Route path="records" element={<PatientRecords />} />
      <Route path="*" element={<Navigate to="/patient/profile" replace />} />
    </Routes>
  );
};

export default PatientRoutes;
