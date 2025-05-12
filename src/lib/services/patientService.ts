
import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

// Get all patients
export const getAllPatients = async () => {
  return prisma.patient.findMany({
    include: {
      appointments: true,
    },
  });
};

// Get patient by ID
export const getPatientById = async (id: string) => {
  return prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: true,
    },
  });
};

// Get patient by email
export const getPatientByEmail = async (email: string) => {
  return prisma.patient.findUnique({
    where: { email },
    include: {
      appointments: true,
    },
  });
};

// Create patient
export const createPatient = async (data: Prisma.PatientCreateInput) => {
  return prisma.patient.create({
    data,
  });
};

// Update patient
export const updatePatient = async (id: string, data: Prisma.PatientUpdateInput) => {
  return prisma.patient.update({
    where: { id },
    data,
  });
};

// Delete patient
export const deletePatient = async (id: string) => {
  return prisma.patient.delete({
    where: { id },
  });
};
