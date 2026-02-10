const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const result = await prisma.personaProfile.updateMany({
      where: { name: 'Jorge' },
      data: { status: 'ACTIVE' }
    });
    console.log('Updated:', result.count);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
