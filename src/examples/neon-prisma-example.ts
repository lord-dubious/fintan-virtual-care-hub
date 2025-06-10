import prisma from '../lib/prisma';

// Example of basic Prisma operations with Neon
export async function examplePrismaOperations() {
  try {
    // Example: Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    console.log('Users:', users);

    // Example: Create a new user
    const newUser = await prisma.user.create({
      data: {
        email: 'example@test.com',
        name: 'Test User',
        role: 'PATIENT',
      },
    });

    console.log('New user created:', newUser);

    // Example: Update a user
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: { name: 'Updated Test User' },
    });

    console.log('Updated user:', updatedUser);

    // Example: Delete a user
    await prisma.user.delete({
      where: { id: newUser.id },
    });

    console.log('User deleted');

    return { success: true };
  } catch (error) {
    console.error('Database operation failed:', error);
    return { success: false, error };
  }
}

// Example of querying appointments with relations
export async function getAppointmentsWithDetails() {
  try {
    const appointments = await prisma.consultation.findMany({
      include: {
        patient: {
          include: {
            user: true,
          },
        },
        provider: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
      take: 10,
    });

    return appointments;
  } catch (error) {
    console.error('Failed to fetch appointments:', error);
    return [];
  }
}
