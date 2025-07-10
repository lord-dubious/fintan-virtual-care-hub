
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

  const usePatientByEmail = (email: string) => useQuery({
    queryKey: ['patients', 'email', email],
    queryFn: async () => {
      // This would need to be implemented in the API
      throw new Error('getByEmail not implemented');
    },
    enabled: false, // Disable until implemented
  });

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
