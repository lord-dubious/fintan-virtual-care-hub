const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getProviderId() {
  try {
    console.log('Getting provider ID...');
    
    const provider = await prisma.provider.findFirst({
      include: {
        user: true
      }
    });

    if (provider) {
      console.log('✅ Provider found:');
      console.log('📧 Email:', provider.user.email);
      console.log('👤 Name:', provider.user.name);
      console.log('🆔 Provider ID:', provider.id);
      console.log('🆔 User ID:', provider.userId);
      console.log('\n🔧 Add this to your .env file:');
      console.log(`VITE_DEFAULT_PROVIDER_ID="${provider.id}"`);
    } else {
      console.log('❌ No provider found. Run the seed script first:');
      console.log('npm run db:seed');
    }
    
  } catch (error) {
    console.error('Error getting provider ID:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getProviderId();
