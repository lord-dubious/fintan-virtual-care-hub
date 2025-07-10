const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createProviderSchedule() {
  try {
    console.log('🔧 Creating provider schedule...');

    // Find the provider created by seed
    const provider = await prisma.provider.findFirst({
      where: {
        user: {
          email: 'dr.smith@drfintan.com'
        }
      },
      include: {
        user: true
      }
    });

    if (!provider) {
      console.log('❌ Provider not found. Run seed script first.');
      return;
    }

    console.log(`✅ Found provider: ${provider.user.name}`);

    // Check if schedule already exists
    const existingSchedule = await prisma.providerSchedule.findFirst({
      where: {
        providerId: provider.id,
        isDefault: true
      }
    });

    if (existingSchedule) {
      console.log('✅ Provider schedule already exists');
      return;
    }

    // Create provider schedule
    const schedule = await prisma.providerSchedule.create({
      data: {
        providerId: provider.id,
        name: 'Default Schedule',
        isDefault: true,
        isActive: true,
        timezone: 'UTC',
        weeklyAvailability: {
          create: [
            {
              dayOfWeek: 'MONDAY',
              isAvailable: true,
              startTime: '09:00',
              endTime: '17:00'
            },
            {
              dayOfWeek: 'TUESDAY',
              isAvailable: true,
              startTime: '09:00',
              endTime: '17:00'
            },
            {
              dayOfWeek: 'WEDNESDAY',
              isAvailable: true,
              startTime: '09:00',
              endTime: '17:00'
            },
            {
              dayOfWeek: 'THURSDAY',
              isAvailable: true,
              startTime: '09:00',
              endTime: '17:00'
            },
            {
              dayOfWeek: 'FRIDAY',
              isAvailable: true,
              startTime: '09:00',
              endTime: '17:00'
            },
            {
              dayOfWeek: 'SATURDAY',
              isAvailable: false,
              startTime: '09:00',
              endTime: '17:00'
            },
            {
              dayOfWeek: 'SUNDAY',
              isAvailable: false,
              startTime: '09:00',
              endTime: '17:00'
            }
          ]
        },
        breakPeriods: {
          create: [
            {
              dayOfWeek: 'MONDAY',
              startTime: '12:00',
              endTime: '13:00',
              title: 'Lunch Break',
              isRecurring: true
            },
            {
              dayOfWeek: 'TUESDAY',
              startTime: '12:00',
              endTime: '13:00',
              title: 'Lunch Break',
              isRecurring: true
            },
            {
              dayOfWeek: 'WEDNESDAY',
              startTime: '12:00',
              endTime: '13:00',
              title: 'Lunch Break',
              isRecurring: true
            },
            {
              dayOfWeek: 'THURSDAY',
              startTime: '12:00',
              endTime: '13:00',
              title: 'Lunch Break',
              isRecurring: true
            },
            {
              dayOfWeek: 'FRIDAY',
              startTime: '12:00',
              endTime: '13:00',
              title: 'Lunch Break',
              isRecurring: true
            }
          ]
        }
      },
      include: {
        weeklyAvailability: true,
        breakPeriods: true
      }
    });

    console.log('✅ Provider schedule created successfully!');
    console.log(`📅 Schedule ID: ${schedule.id}`);
    console.log(`👩‍⚕️ Provider: ${provider.user.name}`);
    console.log(`🕒 Available: Monday-Friday, 9:00 AM - 5:00 PM (with lunch break 12:00-1:00 PM)`);

  } catch (error) {
    console.error('❌ Error creating provider schedule:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProviderSchedule();
