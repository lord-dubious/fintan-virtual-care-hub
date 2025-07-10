
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/api/patients';
import type { CreatePatientData, UpdatePatientData } from '@/api/patients';

export const usePatients = () => {
  const queryClient = useQueryClient();

  const patients = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await patientsApi.getPatients();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch patients');
      }
      return response.data!;
    },
  });

  const usePatientById = (id: string) => useQuery({
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

  // Note: usePatientByEmail removed as it was not implemented
  // If needed, implement the API endpoint first, then add the hook

  const createPatient = useMutation({
    mutationFn: async (newPatient: CreatePatientData) => {
      const response = await patientsApi.createPatient(newPatient);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create patient');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const updatePatient = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdatePatientData }) => {
      const response = await patientsApi.updatePatient(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update patient');
      }
      return response.data!;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patients', id] });
    },
  });

  const deletePatient = useMutation({
    mutationFn: async (id: string) => {
      const response = await patientsApi.deletePatient(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete patient');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  return {
    patients,
    usePatientById,
    usePatientByEmail,
    createPatient,
    updatePatient,
    deletePatient
  };
};
