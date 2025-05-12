
import { prisma } from '../prisma';
import type { Appointment } from '@prisma/client';

export type AppointmentCreateInput = {
  patientId: string;
  dateTime: Date;
  type: string;
  status: string;
  notes?: string;
};

export type AppointmentUpdateInput = Partial<AppointmentCreateInput>;

export const appointmentService = {
  // Get all appointments
  getAll: async () => {
    try {
      return await prisma.appointment.findMany({
        include: { patient: true },
        orderBy: { dateTime: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  // Get appointment by ID
  getById: async (id: string) => {
    try {
      return await prisma.appointment.findUnique({
        where: { id },
        include: { patient: true }
      });
    } catch (error) {
      console.error(`Error fetching appointment ${id}:`, error);
      throw error;
    }
  },

  // Create new appointment
  create: async (data: AppointmentCreateInput) => {
    try {
      return await prisma.appointment.create({ data });
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  // Update appointment
  update: async (id: string, data: AppointmentUpdateInput) => {
    try {
      return await prisma.appointment.update({
        where: { id },
        data
      });
    } catch (error) {
      console.error(`Error updating appointment ${id}:`, error);
      throw error;
    }
  },
  
  // Delete appointment
  delete: async (id: string) => {
    try {
      return await prisma.appointment.delete({
        where: { id }
      });
    } catch (error) {
      console.error(`Error deleting appointment ${id}:`, error);
      throw error;
    }
  },

  // Get upcoming appointments
  getUpcoming: async () => {
    try {
      return await prisma.appointment.findMany({
        where: {
          dateTime: { gte: new Date() },
          status: 'Scheduled'
        },
        include: { patient: true },
        orderBy: { dateTime: 'asc' },
        take: 5
      });
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  }
};
