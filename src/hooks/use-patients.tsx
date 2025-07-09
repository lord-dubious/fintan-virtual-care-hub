import {
  PatientCreateInput,
  patientService,
  PatientUpdateInput,
} from "@/lib/services/patientProfileService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePatients = () => {
  const queryClient = useQueryClient();

  const patients = useQuery({
    queryKey: ["patients"],
    queryFn: patientService.getAll,
  });

  const usePatientById = (id: string) =>
    useQuery({
      queryKey: ["patients", id],
      queryFn: () => patientService.getById(id),
      enabled: !!id,
    });

  const usePatientByEmail = (email: string) =>
    useQuery({
      queryKey: ["patients", "email", email],
      queryFn: () => patientService.getByEmail(email),
      enabled: !!email,
    });

  const createPatient = useMutation({
    mutationFn: (newPatient: PatientCreateInput) =>
      patientService.create(newPatient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  const updatePatient = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientUpdateInput }) =>
      patientService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patients", id] });
    },
  });

  const deletePatient = useMutation({
    mutationFn: (id: string) => patientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });

  return {
    patients,
    usePatientById,
    usePatientByEmail,
    createPatient,
    updatePatient,
    deletePatient,
  };
};
