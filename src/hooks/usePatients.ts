import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi, Patient, PatientFilters, CreatePatientData, UpdatePatientData } from '@/api/patients';
import { useToast } from '@/hooks/use-toast';

export const usePatients = (filters?: PatientFilters) => {
  return useQuery({
    queryKey: ['patients', filters],
    queryFn: async () => {
      const response = await patientsApi.getPatients(filters);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch patients');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePatient = (id: string) => {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const response = await patientsApi.getPatient(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch patient');
      }
      return response.data!;
    },
    enabled: !!id,
  });
};

export const usePatientMedicalHistory = (patientId: string) => {
  return useQuery({
    queryKey: ['patients', patientId, 'medical-history'],
    queryFn: async () => {
      const response = await patientsApi.getPatientMedicalHistory(patientId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch medical history');
      }
      return response.data!;
    },
    enabled: !!patientId,
  });
};

export const usePatientAppointments = (patientId: string) => {
  return useQuery({
    queryKey: ['patients', patientId, 'appointments'],
    queryFn: async () => {
      const response = await patientsApi.getPatientAppointments(patientId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch patient appointments');
      }
      return response.data!;
    },
    enabled: !!patientId,
  });
};

export const useCreatePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePatientData) => {
      const response = await patientsApi.createPatient(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create patient');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Patient Created",
        description: "The patient has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Patient",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePatientData }) => {
      const response = await patientsApi.updatePatient(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update patient');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', data.id] });
      toast({
        title: "Patient Updated",
        description: "The patient information has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Patient",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAddMedicalRecord = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ patientId, record }: { 
      patientId: string; 
      record: { date: Date; type: string; notes: string; diagnosis?: string; prescription?: string; }
    }) => {
      const response = await patientsApi.addMedicalRecord(patientId, record);
      if (!response.success) {
        throw new Error(response.error || 'Failed to add medical record');
      }
      return response.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId, 'medical-history'] });
      toast({
        title: "Medical Record Added",
        description: "The medical record has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Add Medical Record",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSearchPatients = (query: string) => {
  return useQuery({
    queryKey: ['patients', 'search', query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await patientsApi.searchPatients(query);
      if (!response.success) {
        throw new Error(response.error || 'Failed to search patients');
      }
      return response.data!;
    },
    enabled: !!query.trim(),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const usePatientStats = () => {
  return useQuery({
    queryKey: ['patients', 'stats'],
    queryFn: async () => {
      const response = await patientsApi.getPatientStats();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch patient statistics');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDeactivatePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await patientsApi.deactivatePatient(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to deactivate patient');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Patient Deactivated",
        description: "The patient has been deactivated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Deactivate Patient",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useReactivatePatient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await patientsApi.reactivatePatient(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to reactivate patient');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Patient Reactivated",
        description: "The patient has been reactivated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Reactivate Patient",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const usePatientDashboard = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['patient', 'dashboard'],
    queryFn: async () => {
      const response = await patientsApi.getCurrentPatientProfile();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch patient dashboard data');
      }
      return response.data!;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to load dashboard",
        description: error.message,
        variant: "destructive",
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const usePatientMedicalRecords = (patientId?: string) => {
  return useQuery({
    queryKey: ['patient', patientId || 'current', 'medical-records'],
    queryFn: async () => {
      const response = patientId 
        ? await patientsApi.getMedicalRecords(patientId)
        : await patientsApi.getMedicalRecords('current');
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch patient medical records');
      }
      return response.data!;
    },
    enabled: true, // Can fetch for current patient without ID
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
