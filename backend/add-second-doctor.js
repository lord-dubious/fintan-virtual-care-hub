const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addSecondDoctor() {
  try {
    console.log('🏥 Adding a second doctor to test multi-doctor system...');

    // Check if we already have a second doctor
    const existingDoctors = await prisma.provider.count();
    console.log(`📊 Current doctors in system: ${existingDoctors}`);

    if (existingDoctors >= 2) {
      console.log('✅ Already have multiple doctors in the system');
      return;
    }

    // Create second doctor user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const doctorUser = await prisma.user.create({
      data: {
        email: 'dr.johnson@drfintan.com',
        name: 'Dr. Michael Johnson',
        password: hashedPassword,
        role: 'PROVIDER',
        emailVerified: new Date()
      }
    });

    console.log(`👤 Created user: ${doctorUser.name} (${doctorUser.email})`);

    // Create provider profile
    const provider = await prisma.provider.create({
      data: {
        userId: doctorUser.id,
        specialization: 'Cardiology',
        bio: 'Experienced cardiologist specializing in heart health and cardiovascular diseases.',
        education: 'MD from Harvard Medical School, Cardiology Fellowship at Mayo Clinic',
        experience: '15 years of experience in cardiology and internal medicine',
        licenseNumber: 'MD-CARD-789012',
        consultationFee: 120.00,
        approvalStatus: 'APPROVED',
        isVerified: true,
        isActive: true,
        approvedAt: new Date()
      }
    });

    console.log(`🏥 Created provider: ${provider.id}`);

    // Create default schedule for the new doctor
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
              startTime: '08:00',
              endTime: '16:00'
            },
            {
              dayOfWeek: 'TUESDAY',
              isAvailable: true,
              startTime: '08:00',
              endTime: '16:00'
            },
            {
              dayOfWeek: 'WEDNESDAY',
              isAvailable: true,
              startTime: '08:00',
              endTime: '16:00'
            },
            {
              dayOfWeek: 'THURSDAY',
              isAvailable: true,
              startTime: '08:00',
              endTime: '16:00'
            },
            {
              dayOfWeek: 'FRIDAY',
              isAvailable: true,
              startTime: '08:00',
              endTime: '16:00'
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

    console.log(`📅 Created schedule: ${schedule.id}`);
    console.log('🎉 Second doctor added successfully!');
    console.log('📋 Dr. Michael Johnson - Cardiology - 8:00 AM - 4:00 PM (Monday-Friday)');
    console.log('💰 Consultation Fee: $120.00');
    console.log('');
    console.log('🔧 Now you have a multi-doctor system:');
    console.log('   1. Dr. Sarah Smith (General Medicine) - 9:00 AM - 5:00 PM');
    console.log('   2. Dr. Michael Johnson (Cardiology) - 8:00 AM - 4:00 PM');

  } catch (error) {
    console.error('❌ Error adding second doctor:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSecondDoctor();
