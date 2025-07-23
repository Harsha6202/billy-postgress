// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  const anonymousUser = await prisma.user.create({
    data: {
      id: 'anonymous',
      username: 'Anonymous',
      email: 'anon@example.com',
      password: 'none',
      isAdmin: false,
    },
  });

  await prisma.report.create({
    data: {
      name: '',
      age: 21,
      location: {
        lat: 15.4736293,
        lng: 78.4806592,
        address: 'Nandyal, Andhra Pradesh, India',
        state: 'Andhra Pradesh',
        district: 'Nandyal',
        city: 'Danielpuram',
      },
      bullyingType: 'Cyberstalking',
      perpetratorInfo: {
        platform: 'Impersonation',
        username: 'no',
        profileUrl: '',
        realName: '',
        approximateAge: '',
        additionalDetails: '',
      },
      evidenceLinks: ['no'],
      isAnonymous: true,
      severity: 'high',
      status: 'pending',
      userId: anonymousUser.id,
    },
  });

  console.log('✅ Seeding complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
