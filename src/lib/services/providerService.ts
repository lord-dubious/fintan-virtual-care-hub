import { PrismaClient, Provider, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export interface ProviderCreateInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  title?: string;
  specialization?: string;
  bio?: string;
  licenseNumber?: string;
}

export interface ProviderUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  specialization?: string;
  bio?: string;
  licenseNumber?: string;
}

export interface ProviderWithUser extends Provider {
  user: User;
}

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export const providerService = {
  async create(data: ProviderCreateInput): Promise<ProviderWithUser> {
    const hashedPassword = await hashPassword(data.password);

    return prisma.$transaction(async (tx) => {
      // Create user first
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          phone: data.phone,
          role: UserRole.PROVIDER,
        },
      });

      // Then create provider profile
      const provider = await tx.provider.create({
        data: {
          userId: user.id,
          title: data.title,
          specialization: data.specialization,
          bio: data.bio,
          licenseNumber: data.licenseNumber,
        },
        include: {
          user: true,
        },
      });

      return provider;
    });
  },

  async findById(id: string): Promise<ProviderWithUser | null> {
    return prisma.provider.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  },

  async getById(id: string): Promise<ProviderWithUser | null> {
    return this.findById(id);
  },

  async findByEmail(email: string): Promise<ProviderWithUser | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== UserRole.PROVIDER) {
      return null;
    }

    return prisma.provider.findUnique({
      where: { userId: user.id },
      include: {
        user: true,
      },
    });
  },

  async getByEmail(email: string): Promise<ProviderWithUser | null> {
    return this.findByEmail(email);
  },

  async findMany(filters?: {
    specialization?: string;
  }): Promise<ProviderWithUser[]> {
    const where: any = {};

    if (filters?.specialization) {
      where.specialization = filters.specialization;
    }

    return prisma.provider.findMany({
      where,
      include: {
        user: true,
      },
    });
  },

  async getAll(): Promise<ProviderWithUser[]> {
    return this.findMany();
  },

  async update(id: string, data: ProviderUpdateInput): Promise<ProviderWithUser> {
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!provider) {
      throw new Error(`Provider with ID ${id} not found`);
    }

    return prisma.$transaction(async (tx) => {
      // Update user information
      if (data.name || data.email || data.phone) {
        await tx.user.update({
          where: { id: provider.userId },
          data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
          },
        });
      }

      // Update provider information
      const updatedProvider = await tx.provider.update({
        where: { id },
        data: {
          title: data.title,
          specialization: data.specialization,
          bio: data.bio,
          licenseNumber: data.licenseNumber,
        },
        include: {
          user: true,
        },
      });

      return updatedProvider;
    });
  },

  async delete(id: string): Promise<ProviderWithUser> {
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!provider) {
      throw new Error(`Provider with ID ${id} not found`);
    }

    // Delete the user (will cascade delete the provider due to onDelete: Cascade)
    await prisma.user.delete({
      where: { id: provider.userId },
    });

    return provider;
  },

  async getAvailability(providerId: string, date?: Date): Promise<any[]> {
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        availability: true,
      },
    });

    if (!provider) {
      throw new Error(`Provider with ID ${providerId} not found`);
    }

    // If date is provided, filter by day of week
    if (date) {
      const dayOfWeek = date.getDay(); // 0-6 for Sunday-Saturday
      return provider.availability.filter(a => a.dayOfWeek === dayOfWeek);
    }

    return provider.availability;
  },

  async setAvailability(providerId: string, availabilityData: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }): Promise<any> {
    const { dayOfWeek, startTime, endTime, isAvailable } = availabilityData;

    // Check if availability record already exists
    const existingAvailability = await prisma.availability.findFirst({
      where: {
        providerId,
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    if (existingAvailability) {
      // Update existing availability
      return prisma.availability.update({
        where: { id: existingAvailability.id },
        data: { isAvailable },
      });
    } else {
      // Create new availability
      return prisma.availability.create({
        data: {
          providerId,
          dayOfWeek,
          startTime,
          endTime,
          isAvailable,
        },
      });
    }
  },
};

