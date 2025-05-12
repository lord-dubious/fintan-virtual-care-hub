
import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

// Type definitions for patient inputs
export type PatientCreateInput = Omit<Prisma.PatientCreateInput, 'id'>;
export type PatientUpdateInput = Partial<Omit<Prisma.PatientUpdateInput, 'id'>>;

// Create a service object to export
export const patientService = {
  getAll: async () => {
    return prisma.patient.findMany({
      include: {
        appointments: true,
      },
    });
  },

  getById: async (id: string) => {
    return prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: true,
      },
    });
  },

  getByEmail: async (email: string) => {
    return prisma.patient.findUnique({
      where: { email },
      include: {
        appointments: true,
      },
    });
  },

  create: async (data: PatientCreateInput) => {
    return prisma.patient.create({
      data: data as any,
      include: {
        appointments: true,
      },
    });
  },

  update: async (id: string, data: PatientUpdateInput) => {
    return prisma.patient.update({
      where: { id },
      data: data as any,
      include: {
        appointments: true,
      },
    });
  },

  delete: async (id: string) => {
    return prisma.patient.delete({
      where: { id },
    });
  }
};

// Keep the individual function exports for backward compatibility
export const getAllPatients = patientService.getAll;
export const getPatientById = patientService.getById;
export const getPatientByEmail = patientService.getByEmail;
export const createPatient = patientService.create;
export const updatePatient = patientService.update;
export const deletePatient = patientService.delete;
