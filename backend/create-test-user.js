const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const password = await bcrypt.hash('test123!', 12);
    
    const user = await prisma.user.upsert({
      where: { email: 'chukwurahdavid@gmail.com' },
      update: {},
      create: {
        email: 'chukwurahdavid@gmail.com',
        name: 'David Chukwurah',
        password: password,
        role: 'PATIENT',
        phone: '+1234567890',
        emailVerified: new Date(),
      },
    });

    console.log('✅ Test user created:', user.email);
    console.log('📧 Email: chukwurahdavid@gmail.com');
    console.log('🔑 Password: test123!');
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
