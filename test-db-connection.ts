
import { prisma } from './src/lib/prisma'

async function main() {
  try {
    console.log('Testing connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('Connection successful');
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
