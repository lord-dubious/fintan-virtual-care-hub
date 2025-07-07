import { PrismaClient, Prisma } from '@prisma/client';
import {
  ProviderWithUser,
  ApiResponse,
  ProviderRegistrationFormData,
  UpdateProviderRequest,
  Role,
  User,
} from '../../../shared/domain';
import { hashPassword } from '../../utils/authUtils';
import { Availability } from '@prisma/client';

const prisma = new PrismaClient();

export const providerService = {
  async create(data: ProviderRegistrationFormData): Promise<ApiResponse<ProviderWithUser>> {
    try {
      const hashedPassword = await hashPassword(data.password);

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
            phone: data.phone,
            role: Role.PROVIDER,
          },
        });

        const provider = await tx.provider.create({
          data: {
            userId: user.id,
            specialization: data.specialization,
            bio: data.bio,
          },
          include: {
            user: true,
          },
        });

        return provider;
      });

      return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create provider' };
    }
  },

  async findById(id: string): Promise<ApiResponse<ProviderWithUser | null>> {
    try {
      const provider = await prisma.provider.findUnique({
        where: { id },
        include: {
          user: true,
        },
      });
      return { success: true, data: provider };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to find provider' };
    }
  },

  async getById(id: string): Promise<ApiResponse<ProviderWithUser | null>> {
    return this.findById(id);
  },

  async findByEmail(email: string): Promise<ApiResponse<ProviderWithUser | null>> {
    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user || user.role !== Role.PROVIDER) {
        return { success: true, data: null };
      }

      const provider = await prisma.provider.findUnique({
        where: { userId: user.id },
        include: {
          user: true,
        },
      });
      return { success: true, data: provider };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to find provider' };
    }
  },

  async getByEmail(email: string): Promise<ApiResponse<ProviderWithUser | null>> {
    return this.findByEmail(email);
  },

  async findMany(filters?: { specialization?: string }): Promise<ApiResponse<ProviderWithUser[]>> {
    try {
      const where: Prisma.ProviderWhereInput = {};

      if (filters?.specialization) {
        where.specialization = filters.specialization;
      }

      const providers = await prisma.provider.findMany({
        where,
        include: {
          user: true,
        },
      });
      return { success: true, data: providers };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to find providers' };
    }
  },

  async getAll(): Promise<ApiResponse<ProviderWithUser[]>> {
    return this.findMany();
  },

  async update(id: string, data: Partial<UpdateProviderRequest & { user: Partial<User> }>): Promise<ApiResponse<ProviderWithUser>> {
    try {
      const provider = await prisma.provider.findUnique({
        where: { id },
      });

      if (!provider) {
        return { success: false, error: `Provider with ID ${id} not found` };
      }

      const result = await prisma.$transaction(async (tx) => {
        if (data.user) {
          await tx.user.update({
            where: { id: provider.userId },
            data: data.user,
          });
        }
        
        const { user, ...providerData } = data;

        const updatedProvider = await tx.provider.update({
          where: { id },
          data: providerData,
          include: {
            user: true,
          },
        });

        return updatedProvider;
      });

      return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update provider' };
    }
  },

  async delete(id: string): Promise<ApiResponse<ProviderWithUser>> {
    try {
        const provider = await prisma.provider.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!provider) {
            return { success: false, error: `Provider with ID ${id} not found` };
        }

        await prisma.user.delete({
            where: { id: provider.userId },
        });

        return { success: true, data: provider };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete provider' };
    }
  },

  async getAvailability(providerId: string, date?: Date): Promise<ApiResponse<Availability[]>> {
    try {
      const provider = await prisma.provider.findUnique({
        where: { id: providerId },
        include: {
          availabilities: true,
        },
      });
  
      if (!provider) {
        return { success: false, error: `Provider with ID ${providerId} not found` };
      }
  
      if (date) {
        const dayOfWeekNumber = date.getDay();
        const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayOfWeek = dayNames[dayOfWeekNumber];
        const availability = provider.availabilities.filter(a => a.dayOfWeek === dayOfWeek);
        return { success: true, data: availability };
      }
  
      return { success: true, data: provider.availabilities };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to get availability' };
    }
  },

  async updateAvailability(
    providerId: string,
    availabilityData: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }
  ): Promise<ApiResponse<Availability | null>> {
    try {
      const { dayOfWeek: dayOfWeekNumber, startTime, endTime, isAvailable } = availabilityData;

      // Convert day number to day name
      const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
      const dayOfWeek = dayNames[dayOfWeekNumber];

      const existing = await prisma.availability.findFirst({
        where: { providerId, dayOfWeek, startTime, endTime },
      });

      if (isAvailable) {
        if (existing) {
          // Already available, do nothing
          return { success: true, data: existing };
        } else {
          // Add availability
          const newAvailability = await prisma.availability.create({
            data: {
              providerId,
              dayOfWeek,
              startTime,
              endTime,
            },
          });
          return { success: true, data: newAvailability };
        }
      } else {
        if (existing) {
          // Remove availability
          await prisma.availability.delete({
            where: { id: existing.id },
          });
        }
        // Not available, and doesn't exist, so do nothing
        return { success: true, data: null };
      }
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update availability',
      };
    }
  },
};

