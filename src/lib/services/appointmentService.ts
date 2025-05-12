
import { prisma } from '../prisma';
import { Appointment, Prisma } from '@prisma/client';

// Get all appointments
export const getAllAppointments = async () => {
  return prisma.appointment.findMany({
    include: {
      patient: true,
    },
  });
};

// Get appointment by ID
export const getAppointmentById = async (id: string) => {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
    },
  });
};

// Create appointment
export const createAppointment = async (data: Prisma.AppointmentCreateInput) => {
  return prisma.appointment.create({
    data,
    include: {
      patient: true,
    },
  });
};

// Update appointment
export const updateAppointment = async (id: string, data: Prisma.AppointmentUpdateInput) => {
  return prisma.appointment.update({
    where: { id },
    data,
    include: {
      patient: true,
    },
  });
};

// Delete appointment
export const deleteAppointment = async (id: string) => {
  return prisma.appointment.delete({
    where: { id },
  });
};
