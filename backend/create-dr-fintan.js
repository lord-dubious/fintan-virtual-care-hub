const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDrFintan() {
  try {
    console.log('🏥 Creating Dr. Fintan Ekochin as the only doctor...');

    // First, remove all existing providers and their related data
    console.log('🧹 Cleaning up existing doctors...');
    
    // Delete all appointments first (foreign key constraint)
    await prisma.appointment.deleteMany({});
    console.log('   ✅ Removed all appointments');

    // Delete all provider schedules and related data
    await prisma.breakPeriod.deleteMany({});
    await prisma.weeklyAvailability.deleteMany({});
    await prisma.scheduleException.deleteMany({});
    await prisma.providerSchedule.deleteMany({});
    console.log('   ✅ Removed all schedules');

    // Delete all providers
    await prisma.provider.deleteMany({});
    console.log('   ✅ Removed all providers');

    // Delete all users with PROVIDER role
    await prisma.user.deleteMany({
      where: {
        role: 'PROVIDER'
      }
    });
    console.log('   ✅ Removed all provider users');

    // Create Dr. Fintan Ekochin user
    const hashedPassword = await bcrypt.hash('fintan2025!', 12);
    
    const doctorUser = await prisma.user.create({
      data: {
        email: 'dr.fintan@ekochin.com',
        name: 'Dr. Fintan Ekochin',
        password: hashedPassword,
        role: 'PROVIDER',
        emailVerified: new Date()
      }
    });

    console.log(`👤 Created user: ${doctorUser.name} (${doctorUser.email})`);

    // Create provider profile for Dr. Fintan
    const provider = await prisma.provider.create({
      data: {
        userId: doctorUser.id,
        specialization: 'General Medicine & Wellness',
        bio: 'Dr. Fintan Ekochin is a dedicated healthcare professional committed to providing comprehensive medical care with a focus on patient wellness and preventive medicine.',
        education: 'MD from University College Dublin, Residency in Internal Medicine',
        experience: '10+ years of experience in general practice and preventive medicine',
        licenseNumber: 'MD-IE-2024-001',
        consultationFee: 75.00,
        approvalStatus: 'APPROVED',
        isVerified: true,
        isActive: true,
        approvedAt: new Date()
      }
    });

    console.log(`🏥 Created provider: Dr. Fintan Ekochin (${provider.id})`);

    // Create comprehensive schedule for Dr. Fintan
    const schedule = await prisma.providerSchedule.create({
      data: {
        providerId: provider.id,
        name: 'Dr. Fintan Primary Schedule',
        isDefault: true,
        isActive: true,
        timezone: 'Europe/Dublin',
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
              isAvailable: true,
              startTime: '10:00',
              endTime: '14:00'
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
              startTime: '13:00',
              endTime: '14:00',
              title: 'Lunch Break',
              isRecurring: true
            },
            {
              dayOfWeek: 'TUESDAY',
              startTime: '13:00',
              endTime: '14:00',
              title: 'Lunch Break',
              isRecurring: true
            },
            {
              dayOfWeek: 'WEDNESDAY',
              startTime: '13:00',
              endTime: '14:00',
              title: 'Lunch Break',
              isRecurring: true
            },
            {
              dayOfWeek: 'THURSDAY',
              startTime: '13:00',
              endTime: '14:00',
              title: 'Lunch Break',
              isRecurring: true
            },
            {
              dayOfWeek: 'FRIDAY',
              startTime: '13:00',
              endTime: '14:00',
              title: 'Lunch Break',
              isRecurring: true
            },
            {
              dayOfWeek: 'SATURDAY',
              startTime: '12:00',
              endTime: '12:30',
              title: 'Break',
              isRecurring: true
            }
          ]
        }
      }
    });

    console.log(`📅 Created schedule: ${schedule.id}`);
    console.log('');
    console.log('🎉 Dr. Fintan Ekochin setup complete!');
    console.log('');
    console.log('📋 Doctor Details:');
    console.log(`   Name: Dr. Fintan Ekochin`);
    console.log(`   Email: dr.fintan@ekochin.com`);
    console.log(`   Password: fintan2025!`);
    console.log(`   Specialization: General Medicine & Wellness`);
    console.log(`   Consultation Fee: €85.00`);
    console.log(`   Provider ID: ${provider.id}`);
    console.log('');
    console.log('🕒 Schedule:');
    console.log('   Monday-Friday: 9:00 AM - 5:00 PM (Lunch: 1:00-2:00 PM)');
    console.log('   Saturday: 10:00 AM - 2:00 PM (Break: 12:00-12:30 PM)');
    console.log('   Sunday: Closed');
    console.log('');
    console.log('✅ The booking system now has only Dr. Fintan Ekochin!');

  } catch (error) {
    console.error('❌ Error creating Dr. Fintan:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDrFintan();
