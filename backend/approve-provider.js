const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function approveProvider() {
  try {
    console.log('🔧 Approving provider...');
    
    const provider = await prisma.provider.findFirst();
    
    if (!provider) {
      console.log('❌ No provider found');
      return;
    }

    const updatedProvider = await prisma.provider.update({
      where: { id: provider.id },
      data: {
        approvalStatus: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: 'system'
      },
      include: {
        user: true
      }
    });

    console.log('✅ Provider approved successfully!');
    console.log('📧 Email:', updatedProvider.user.email);
    console.log('👤 Name:', updatedProvider.user.name);
    console.log('🆔 Provider ID:', updatedProvider.id);
    console.log('✅ Approval Status:', updatedProvider.approvalStatus);
    console.log('📅 Approved At:', updatedProvider.approvedAt);
    
  } catch (error) {
    console.error('❌ Error approving provider:', error);
  } finally {
    await prisma.$disconnect();
  }
}

approveProvider();
