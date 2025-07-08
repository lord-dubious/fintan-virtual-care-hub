const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAvailability() {
  try {
    console.log('🔧 Creating availability data...');
    
    const provider = await prisma.provider.findFirst();
    
    if (!provider) {
      console.log('❌ No provider found');
      return;
    }

    console.log('✅ Provider found:', provider.id);

    // Delete existing availability
    await prisma.availability.deleteMany({
      where: { providerId: provider.id }
    });

    // Create availability for Monday to Friday, 9 AM to 5 PM
    const availabilityData = [
      { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00' },
      { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00' },
    ];

    for (const avail of availabilityData) {
      await prisma.availability.create({
        data: {
          providerId: provider.id,
          dayOfWeek: avail.dayOfWeek,
          startTime: avail.startTime,
          endTime: avail.endTime,
          isAvailable: true
        }
      });
    }

    console.log('✅ Availability created successfully!');
    console.log('📅 Available: Monday-Friday, 9:00 AM - 5:00 PM');

    // Verify the data
    const availability = await prisma.availability.findMany({
      where: { providerId: provider.id }
    });

    console.log('\n📋 Created availability:');
    availability.forEach(avail => {
      console.log(`  ${avail.dayOfWeek}: ${avail.startTime} - ${avail.endTime}`);
    });

  } catch (error) {
    console.error('❌ Error creating availability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAvailability();
