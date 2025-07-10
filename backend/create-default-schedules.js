const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createDefaultSchedules() {
  try {
    console.log('🔧 Creating default schedules for providers without schedules...');

    // Find all providers without default schedules
    const providersWithoutSchedules = await prisma.provider.findMany({
      where: {
        isActive: true,
        schedules: {
          none: {
            isDefault: true,
            isActive: true
          }
        }
      },
      include: {
        user: true,
        schedules: true
      }
    });

    console.log(`✅ Found ${providersWithoutSchedules.length} providers without default schedules`);

    for (const provider of providersWithoutSchedules) {
      console.log(`📅 Creating default schedule for: ${provider.user.name}`);

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
        }
      });

      console.log(`   ✅ Created schedule ${schedule.id} for ${provider.user.name}`);
    }

    if (providersWithoutSchedules.length === 0) {
      console.log('✅ All providers already have default schedules');
    } else {
      console.log(`🎉 Created default schedules for ${providersWithoutSchedules.length} providers`);
      console.log('📋 Default schedule: Monday-Friday, 9:00 AM - 5:00 PM (with lunch break 12:00-1:00 PM)');
    }

  } catch (error) {
    console.error('❌ Error creating default schedules:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDefaultSchedules();
