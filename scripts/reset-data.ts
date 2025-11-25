import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Starting database reset (except admins)...\n');

  try {
    // Delete in correct order due to foreign key constraints
    console.log('Deleting payments...');
    const paymentsDeleted = await prisma.payment.deleteMany({});
    console.log(`✅ Deleted ${paymentsDeleted.count} payments\n`);

    console.log('Deleting teams...');
    const teamsDeleted = await prisma.team.deleteMany({});
    console.log(`✅ Deleted ${teamsDeleted.count} teams\n`);

    console.log('Deleting team applications...');
    const applicationsDeleted = await prisma.teamApplication.deleteMany({});
    console.log(`✅ Deleted ${applicationsDeleted.count} team applications\n`);

    console.log('Deleting settings...');
    const settingsDeleted = await prisma.settings.deleteMany({});
    console.log(`✅ Deleted ${settingsDeleted.count} settings records\n`);

    // Admin table is NOT deleted
    const adminCount = await prisma.admin.count();
    console.log(`ℹ️  Admin users preserved: ${adminCount}\n`);

    console.log('✅ Database reset complete! All data deleted except admin users.');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
