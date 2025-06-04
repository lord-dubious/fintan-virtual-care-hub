
import { PrismaClient, Appointment } from '@prisma/client';

const prisma = new PrismaClient();

export const appointmentService = {
  async create(data: any): Promise<Appointment> {
    return await prisma.appointment.create({
      data,
    });
  },

  async findById(id: string): Promise<Appointment | null> {
    return await prisma.appointment.findUnique({
      where: { id },
    });
  },

  async findMany(): Promise<Appointment[]> {
    return await prisma.appointment.findMany();
  },

  async update(id: string, data: any): Promise<Appointment> {
    return await prisma.appointment.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<Appointment> {
    return await prisma.appointment.delete({
      where: { id },
    });
  },

  async getUpcoming(): Promise<Appointment[]> {
    const now = new Date();
    return await prisma.appointment.findMany({
      where: {
        appointmentDate: {
          gte: now,
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });
  },
};
