import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database reset...')
  
  // Delete all teams
  const deletedTeams = await prisma.team.deleteMany({})
  console.log(`✓ Deleted ${deletedTeams.count} teams`)
  
  // Delete all team applications
  const deletedApplications = await prisma.teamApplication.deleteMany({})
  console.log(`✓ Deleted ${deletedApplications.count} team applications`)
  
  console.log('\n✅ Database reset completed successfully!')
  console.log('All teams and applications have been removed.')
}

main()
  .catch((e) => {
    console.error('❌ Error during reset:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
