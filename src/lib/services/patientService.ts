
import { prisma } from '../prisma';
import type { Patient } from '@prisma/client';

export type PatientCreateInput = {
  name: string;
  email: string;
  phone?: string;
  medicalHistory?: string;
};

export type PatientUpdateInput = Partial<PatientCreateInput>;

export const patientService = {
  // Get all patients
  getAll: async () => {
    try {
      return await prisma.patient.findMany({
        orderBy: { name: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get patient by ID
  getById: async (id: string) => {
    try {
      return await prisma.patient.findUnique({
        where: { id },
        include: { appointments: true }
      });
    } catch (error) {
      console.error(`Error fetching patient ${id}:`, error);
      throw error;
    }
  },

  // Get patient by email
  getByEmail: async (email: string) => {
    try {
      return await prisma.patient.findUnique({
        where: { email }
      });
    } catch (error) {
      console.error(`Error fetching patient by email ${email}:`, error);
      throw error;
    }
  },

  // Create new patient
  create: async (data: PatientCreateInput) => {
    try {
      return await prisma.patient.create({ data });
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // Update patient
  update: async (id: string, data: PatientUpdateInput) => {
    try {
      return await prisma.patient.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error(`Error updating patient ${id}:`, error);
      throw error;
    }
  },
  
  // Delete patient
  delete: async (id: string) => {
    try {
      return await prisma.patient.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting patient ${id}:`, error);
      throw error;
    }
  }
};
