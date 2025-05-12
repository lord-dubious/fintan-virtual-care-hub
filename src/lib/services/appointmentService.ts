import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

// Type definitions for appointment inputs
export type AppointmentCreateInput = Prisma.AppointmentUncheckedCreateInput;
export type AppointmentUpdateInput = Prisma.AppointmentUncheckedUpdateInput;

// Create a service object to export
export const appointmentService = {
  getAll: async () => {
    return prisma.appointment.findMany({
      include: {
        patient: true,
      },
    });
  },

  getUpcoming: async () => {
    const now = new Date();
    return prisma.appointment.findMany({
      where: {
        dateTime: {
          gte: now
        },
        status: {
          not: 'Cancelled'
        }
      },
      include: {
        patient: true,
      },
      orderBy: {
        dateTime: 'asc'
      }
    });
  },

  getById: async (id: string) => {
    return prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
      },
    });
  },

  create: async (data: AppointmentCreateInput) => {
    return prisma.appointment.create({
      data,
      include: {
        patient: true,
      },
    });
  },

  update: async (id: string, data: AppointmentUpdateInput) => {
    return prisma.appointment.update({
      where: { id },
      data,
      include: {
        patient: true,
      },
    });
  },

  delete: async (id: string) => {
    return prisma.appointment.delete({
      where: { id },
    });
  }
};

// Keep the individual function exports for backward compatibility
export const getAllAppointments = appointmentService.getAll;
export const getAppointmentById = appointmentService.getById;
export const createAppointment = appointmentService.create;
export const updateAppointment = appointmentService.update;
export const deleteAppointment = appointmentService.delete;
