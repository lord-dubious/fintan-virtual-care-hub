const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAvailability() {
  try {
    console.log('🔍 Testing availability system...\n');
    
    // 1. Check if provider exists and is approved
    const provider = await prisma.provider.findFirst({
      include: {
        user: true,
        availability: true
      }
    });

    if (!provider) {
      console.log('❌ No provider found');
      return;
    }

    console.log('✅ Provider found:');
    console.log('📧 Email:', provider.user.email);
    console.log('👤 Name:', provider.user.name);
    console.log('🆔 Provider ID:', provider.id);
    console.log('✅ Approval Status:', provider.approvalStatus);
    console.log('✅ Is Active:', provider.isActive);
    console.log('✅ Is Verified:', provider.isVerified);
    console.log('\n');

    // 2. Check availability records
    console.log('📅 Availability Records:');
    if (provider.availability.length === 0) {
      console.log('❌ No availability records found');
    } else {
      provider.availability.forEach(avail => {
        console.log(`  ${avail.dayOfWeek}: ${avail.startTime} - ${avail.endTime} (Available: ${avail.isAvailable})`);
      });
    }
    console.log('\n');

    // 3. Test the calendar API endpoint logic
    if (provider.approvalStatus !== 'APPROVED') {
      console.log('❌ Provider not approved - this will cause calendar API to fail');
      console.log('   Current status:', provider.approvalStatus);
    } else {
      console.log('✅ Provider is approved');
    }

    if (!provider.isActive) {
      console.log('❌ Provider not active - this will cause calendar API to fail');
    } else {
      console.log('✅ Provider is active');
    }

    // 4. Check for existing appointments
    const appointments = await prisma.appointment.findMany({
      where: { providerId: provider.id },
      take: 5
    });

    console.log('\n📋 Recent Appointments:');
    if (appointments.length === 0) {
      console.log('   No appointments found');
    } else {
      appointments.forEach(apt => {
        console.log(`   ${apt.appointmentDate} - Status: ${apt.status}`);
      });
    }

    console.log('\n🔧 API Test URLs:');
    console.log(`   Providers: http://50.118.225.14:3000/api/providers`);
    console.log(`   Provider Details: http://50.118.225.14:3000/api/providers/${provider.id}`);
    console.log(`   Calendar Availability: http://50.118.225.14:3000/api/calendar/availability?providerId=${provider.id}&dateFrom=2025-01-07T00:00:00.000Z&dateTo=2025-01-14T00:00:00.000Z`);

  } catch (error) {
    console.error('❌ Error testing availability:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAvailability();
