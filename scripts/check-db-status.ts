import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const teamCount = await prisma.team.count()
  const applicationCount = await prisma.teamApplication.count()
  
  console.log('Database Status:')
  console.log('================')
  console.log(`Teams: ${teamCount}`)
  console.log(`Applications: ${applicationCount}`)
  console.log('================')
  
  if (teamCount === 0 && applicationCount === 0) {
    console.log('✅ Database is empty - reset successful!')
  } else {
    console.log('⚠️  Database still contains data')
  }
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
