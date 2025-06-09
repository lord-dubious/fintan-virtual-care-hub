import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

async function main() {
  console.log('Starting seed...');

  // Clear existing data
  await prisma.prescription.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.consultation.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.availability.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Cleared existing data');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@virtualcare.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('Created admin user');

  // Create providers (doctors)
  const providers = [];
  const providerData = [
    {
      email: 'dr.smith@virtualcare.com',
      password: 'doctor123',
      name: 'Dr. John Smith',
      phone: '(555) 123-4567',
      title: 'Dr.',
      specialization: 'General Medicine',
      bio: 'Board-certified physician with over 10 years of experience in general medicine and primary care.',
      licenseNumber: 'MD12345',
    },
    {
      email: 'dr.patel@virtualcare.com',
      password: 'doctor123',
      name: 'Dr. Priya Patel',
      phone: '(555) 234-5678',
      title: 'Dr.',
      specialization: 'Pediatrics',
      bio: 'Pediatrician with a focus on child development and preventive care.',
      licenseNumber: 'MD23456',
    },
    {
      email: 'dr.johnson@virtualcare.com',
      password: 'doctor123',
      name: 'Dr. Robert Johnson',
      phone: '(555) 345-6789',
      title: 'Dr.',
      specialization: 'Dermatology',
      bio: 'Dermatologist specializing in skin conditions and cosmetic procedures.',
      licenseNumber: 'MD34567',
    },
  ];

  for (const data of providerData) {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: 'PROVIDER',
      },
    });

    const provider = await prisma.provider.create({
      data: {
        userId: user.id,
        title: data.title,
        specialization: data.specialization,
        bio: data.bio,
        licenseNumber: data.licenseNumber,
      },
    });

    providers.push({ user, provider });
    console.log(`Created provider: ${data.name}`);

    // Create availability for each provider
    const daysOfWeek = [0, 1, 2, 3, 4]; // Sunday to Thursday
    for (const day of daysOfWeek) {
      await prisma.availability.create({
        data: {
          providerId: provider.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        },
      });
    }
    console.log(`Created availability for: ${data.name}`);
  }

  // Create patients
  const patients = [];
  const patientData = [
    {
      email: 'john.doe@example.com',
      password: 'patient123',
      name: 'John Doe',
      phone: '(555) 987-6543',
      dateOfBirth: new Date('1985-05-15'),
      address: '123 Main St, Anytown, USA',
      emergencyContact: 'Jane Doe (Wife) - (555) 987-6544',
    },
    {
      email: 'sarah.jones@example.com',
      password: 'patient123',
      name: 'Sarah Jones',
      phone: '(555) 876-5432',
      dateOfBirth: new Date('1990-08-21'),
      address: '456 Oak Ave, Somewhere, USA',
      emergencyContact: 'Mike Jones (Husband) - (555) 876-5433',
    },
    {
      email: 'michael.brown@example.com',
      password: 'patient123',
      name: 'Michael Brown',
      phone: '(555) 765-4321',
      dateOfBirth: new Date('1978-12-03'),
      address: '789 Pine St, Nowhere, USA',
      emergencyContact: 'Lisa Brown (Sister) - (555) 765-4322',
    },
    {
      email: 'emily.williams@example.com',
      password: 'patient123',
      name: 'Emily Williams',
      phone: '(555) 654-3210',
      dateOfBirth: new Date('1995-03-27'),
      address: '321 Elm St, Anyplace, USA',
      emergencyContact: 'Robert Williams (Father) - (555) 654-3211',
    },
  ];

  for (const data of patientData) {
    const hashedPassword = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: 'PATIENT',
      },
    });

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        emergencyContact: data.emergencyContact,
      },
    });

    patients.push({ user, patient });
    console.log(`Created patient: ${data.name}`);

    // Create medical records for each patient
    const medicalRecordData = [
      {
        title: 'Annual Physical',
        description: 'Routine annual physical examination. All vitals normal.',
        recordType: 'Examination',
        recordDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      },
      {
        title: 'Allergy Diagnosis',
        description: 'Patient diagnosed with seasonal allergies. Prescribed antihistamines.',
        recordType: 'Diagnosis',
        recordDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 days ago
      },
    ];

    for (const record of medicalRecordData) {
      await prisma.medicalRecord.create({
        data: {
          patientId: patient.id,
          title: record.title,
          description: record.description,
          recordType: record.recordType,
          recordDate: record.recordDate,
        },
      });
    }
    console.log(`Created medical records for: ${data.name}`);
  }

  // Create appointments, consultations, and payments
  const now = new Date();
  const appointmentData = [
    {
      patientIndex: 0,
      providerIndex: 0,
      consultationType: 'VIDEO',
      appointmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0), // Tomorrow at 10:00 AM
      reason: 'Annual check-up and prescription renewal',
      status: 'CONFIRMED',
      consultationStatus: 'SCHEDULED',
      paymentStatus: 'COMPLETED',
      amount: 75.00,
    },
    {
      patientIndex: 1,
      providerIndex: 1,
      consultationType: 'AUDIO',
      appointmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 30), // Tomorrow at 2:30 PM
      reason: 'Follow-up on recent lab results',
      status: 'CONFIRMED',
      consultationStatus: 'SCHEDULED',
      paymentStatus: 'COMPLETED',
      amount: 50.00,
    },
    {
      patientIndex: 2,
      providerIndex: 2,
      consultationType: 'VIDEO',
      appointmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 11, 15), // Day after tomorrow at 11:15 AM
      reason: 'Skin rash consultation',
      status: 'SCHEDULED',
      consultationStatus: 'SCHEDULED',
      paymentStatus: 'PENDING',
      amount: 75.00,
    },
    {
      patientIndex: 3,
      providerIndex: 0,
      consultationType: 'AUDIO',
      appointmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 9, 0), // 3 days from now at 9:00 AM
      reason: 'Headache and dizziness follow-up',
      status: 'SCHEDULED',
      consultationStatus: 'SCHEDULED',
      paymentStatus: 'PENDING',
      amount: 50.00,
    },
    {
      patientIndex: 0,
      providerIndex: 1,
      consultationType: 'VIDEO',
      appointmentDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 13, 0), // 7 days ago at 1:00 PM
      reason: 'Flu symptoms and fever',
      status: 'COMPLETED',
      consultationStatus: 'COMPLETED',
      paymentStatus: 'COMPLETED',
      amount: 75.00,
      notes: 'Patient presented with flu-like symptoms. Prescribed rest, fluids, and over-the-counter pain relievers.',
      prescriptions: [
        {
          medication: 'Acetaminophen',
          dosage: '500mg',
          frequency: 'Every 6 hours as needed',
          duration: '5 days',
          instructions: 'Take with food or water for pain and fever',
        },
      ],
    },
  ];

  for (const data of appointmentData) {
    const patient = patients[data.patientIndex];
    const provider = providers[data.providerIndex];

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.patient.id,
        providerId: provider.provider.id,
        createdById: patient.user.id,
        consultationType: data.consultationType,
        appointmentDate: data.appointmentDate,
        reason: data.reason,
        status: data.status,
      },
    });

    // Create consultation
    const sessionId = `session_${appointment.id}_${Date.now()}`;
    const roomUrl = `https://virtualcare.daily.co/${appointment.id}`;
    
    const consultation = await prisma.consultation.create({
      data: {
        appointmentId: appointment.id,
        sessionId: sessionId,
        roomUrl: roomUrl,
        status: data.consultationStatus,
        notes: data.notes || null,
        startTime: data.status === 'COMPLETED' ? new Date(data.appointmentDate.getTime() - 30 * 60 * 1000) : null,
        endTime: data.status === 'COMPLETED' ? data.appointmentDate : null,
      },
    });

    // Create payment
    await prisma.payment.create({
      data: {
        appointmentId: appointment.id,
        amount: data.amount,
        paymentMethod: 'STRIPE',
        transactionId: data.paymentStatus === 'COMPLETED' ? `tx_${Date.now()}` : null,
        status: data.paymentStatus,
      },
    });

    console.log(`Created appointment, consultation, and payment for ${patient.user.name} with ${provider.user.name}`);

    // Create prescriptions if any
    if (data.prescriptions) {
      for (const prescriptionData of data.prescriptions) {
        await prisma.prescription.create({
          data: {
            consultationId: consultation.id,
            ...prescriptionData,
          },
        });
      }
      console.log(`Created prescriptions for consultation ${consultation.id}`);
    }
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

