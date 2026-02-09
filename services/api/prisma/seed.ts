import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@cloned.app' },
    update: {},
    create: {
      email: 'demo@cloned.app',
      passwordHash,
      displayName: 'Demo User',
    },
  });

  await prisma.personaProfile.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      userId: user.id,
      name: 'Jorge',
      status: 'ENROLLING',
      coverageMap: {
        LINGUISTIC: { count: 0, minRequired: 5, covered: false },
        LOGICAL: { count: 0, minRequired: 5, covered: false },
        MORAL: { count: 0, minRequired: 5, covered: false },
        VALUES: { count: 0, minRequired: 5, covered: false },
        ASPIRATIONS: { count: 0, minRequired: 5, covered: false },
        PREFERENCES: { count: 0, minRequired: 5, covered: false },
        AUTOBIOGRAPHICAL: { count: 0, minRequired: 5, covered: false },
        EMOTIONAL: { count: 0, minRequired: 5, covered: false },
      },
    },
  });

  console.log('Seed complete: demo@cloned.app / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
