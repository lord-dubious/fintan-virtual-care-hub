import { PrismaClient } from '@prisma/client';
import { Provider, User, UserRole } from '../../types/prisma';

const prisma = new PrismaClient();

export const providerService = {
  async createProvider(userId: string, specialization: string, licenseNumber: string, bio: string, experience: number): Promise<Provider | null> {
    try {
      const provider = await prisma.provider.create({
        data: {
          userId,
          specialization,
          licenseNumber,
          bio,
          experience,
        },
      });
      return provider;
    } catch (error) {
      console.error('Error creating provider:', error);
      return null;
    }
  },

  async getProviderById(id: string): Promise<Provider | null> {
    try {
      const provider = await prisma.provider.findUnique({
        where: {
          id: id,
        },
        include: {
          user: true,
        },
      });
      return provider;
    } catch (error) {
      console.error('Error fetching provider:', error);
      return null;
    }
  },

  async getProviderByUserId(userId: string): Promise<Provider | null> {
    try {
      const provider = await prisma.provider.findUnique({
        where: {
          userId: userId,
        },
        include: {
          user: true,
        },
      });
      return provider;
    } catch (error) {
      console.error('Error fetching provider:', error);
      return null;
    }
  },

  async updateProvider(id: string, data: Partial<Provider>): Promise<Provider | null> {
    try {
      const provider = await prisma.provider.update({
        where: {
          id: id,
        },
        data: data,
      });
      return provider;
    } catch (error) {
      console.error('Error updating provider:', error);
      return null;
    }
  },

  async deleteProvider(id: string): Promise<Provider | null> {
    try {
      const provider = await prisma.provider.delete({
        where: {
          id: id,
        },
      });
      return provider;
    } catch (error) {
      console.error('Error deleting provider:', error);
      return null;
    }
  },
};
