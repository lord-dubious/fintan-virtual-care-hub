import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@drfintan.com' },
    update: {},
    create: {
      email: 'admin@drfintan.com',
      name: 'Dr. Fintan Admin',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+1234567890',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create sample provider
  const providerPassword = await bcrypt.hash('provider123!', 12);
  const providerUser = await prisma.user.upsert({
    where: { email: 'dr.smith@drfintan.com' },
    update: {},
    create: {
      email: 'dr.smith@drfintan.com',
      name: 'Dr. Sarah Smith',
      password: providerPassword,
      role: 'PROVIDER',
      phone: '+1234567891',
      emailVerified: new Date(),
    },
  });

  const provider = await prisma.provider.upsert({
    where: { userId: providerUser.id },
    update: {},
    create: {
      userId: providerUser.id,
      specialization: 'General Medicine',
      bio: 'Dr. Sarah Smith is a board-certified physician with over 10 years of experience in general medicine and telemedicine.',
      education: {
        degree: 'MD',
        university: 'Harvard Medical School',
        year: 2012,
      },
      experience: {
        years: 10,
        specialties: ['General Medicine', 'Preventive Care', 'Telemedicine'],
      },
      licenseNumber: 'MD123456789',
      isVerified: true,
      isActive: true,
      consultationFee: 75.00,
    },
  });

  console.log('✅ Provider created:', providerUser.email);

  // Create provider availability (Monday to Friday, 9 AM to 5 PM)
  const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  for (const day of weekdays) {
    await prisma.availability.upsert({
      where: {
        providerId_dayOfWeek_startTime: {
          providerId: provider.id,
          dayOfWeek: day,
          startTime: '09:00',
        },
      },
      update: {},
      create: {
        providerId: provider.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: true,
      },
    });
  }

  console.log('✅ Provider availability created');

  // Create sample patient
  const patientPassword = await bcrypt.hash('patient123!', 12);
  const patientUser = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: patientPassword,
      role: 'PATIENT',
      phone: '+1234567892',
      emailVerified: new Date(),
    },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      dateOfBirth: new Date('1985-06-15'),
      address: '123 Main St, Anytown, USA 12345',
      phone: '+1234567892',
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1234567893',
      },
      medicalHistory: {
        allergies: ['Penicillin'],
        medications: ['Lisinopril 10mg'],
        conditions: ['Hypertension'],
      },
      insurance: {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'BC123456789',
        groupNumber: 'GRP001',
      },
      preferences: {
        language: 'English',
        timezone: 'America/New_York',
        notifications: {
          email: true,
          sms: true,
          push: true,
        },
      },
    },
  });

  console.log('✅ Patient created:', patientUser.email);

  // Create sample appointment
  const appointmentDate = new Date();
  appointmentDate.setDate(appointmentDate.getDate() + 7); // Next week
  appointmentDate.setHours(10, 0, 0, 0); // 10:00 AM

  const appointment = await prisma.appointment.create({
    data: {
      providerId: provider.id,
      patientId: patient.id,
      appointmentDate,
      reason: 'Annual check-up and blood pressure monitoring',
      status: 'SCHEDULED',
      consultationType: 'VIDEO',
    },
  });

  console.log('✅ Sample appointment created for:', appointmentDate.toISOString());

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Created accounts:');
  console.log('👨‍💼 Admin: admin@drfintan.com / admin123!');
  console.log('👩‍⚕️ Provider: dr.smith@drfintan.com / provider123!');
  console.log('👤 Patient: john.doe@example.com / patient123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
