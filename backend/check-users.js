const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');
    
    const users = await prisma.user.findMany({
      include: { 
        provider: true,
        patient: true
      }
    });
    
    console.log('👥 Users in database:');
    users.forEach(user => {
      console.log(`📧 ${user.email}`);
      console.log(`👤 Name: ${user.name}`);
      console.log(`🎭 Role: ${user.role}`);
      console.log(`🏥 Has Provider: ${!!user.provider}`);
      console.log(`🏥 Has Patient: ${!!user.patient}`);
      if (user.provider) {
        console.log(`   Provider ID: ${user.provider.id}`);
        console.log(`   Specialization: ${user.provider.specialization}`);
        console.log(`   Approval Status: ${user.provider.approvalStatus}`);
      }
      console.log('---');
    });
    
    console.log('\n🔧 For login testing:');
    const doctorUser = users.find(u => u.role === 'DOCTOR' || u.provider);
    if (doctorUser) {
      console.log(`✅ Doctor login: ${doctorUser.email} / test123!`);
      console.log(`   Should redirect to: /doctor/dashboard`);
    }
    
    const patientUser = users.find(u => u.role === 'PATIENT');
    if (patientUser) {
      console.log(`✅ Patient login: ${patientUser.email} / test123!`);
      console.log(`   Should redirect to: /dashboard`);
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
