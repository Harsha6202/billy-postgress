import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.experience.deleteMany();
  await prisma.question.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@gmail.com',
      password: 'Admin@6202',
      isAdmin: true,
    },
  });
  const officer = await prisma.user.create({
    data: {
      username: 'cybercrime',
      email: 'cybercrime@gmail.com',
      password: 'Cyber@6202',
      isAdmin: false, // You can add a role field if needed
    },
  });
  // Example regular user
  const user1 = await prisma.user.create({
    data: {
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
      isAdmin: false,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      username: 'bob',
      email: 'bob@example.com',
      password: 'password456',
      isAdmin: false,
    },
  });

  // Seed Reports
  await prisma.report.create({
    data: {
      userId: user1.id,
      name: 'Alice',
      age: 20,
      location: { city: 'New York', state: 'NY' },
      bullyingType: 'Harassment',
      perpetratorInfo: { platform: 'Instagram', username: 'badguy' },
      evidenceLinks: ['https://example.com/evidence1'],
      status: 'pending',
      severity: 'medium',
      isAnonymous: false,
      description: 'Harassment on Instagram',
    },
  });

  // Seed Questions
  await prisma.question.create({
    data: {
      userId: user2.id,
      username: 'bob',
      title: 'How to report cyberbullying?',
      content: 'What steps should I take?',
      answers: [],
      isAnonymous: false,
      status: 'approved',
      description: 'General question about reporting',
    },
  });

  // Seed Experiences
  await prisma.experience.create({
    data: {
      userId: user1.id,
      title: 'My Experience',
      content: 'I was bullied online...',
      tags: ['bullying', 'online'],
      status: 'approved',
      comments: [],
      likes: 5,
      isAnonymous: false,
      author: { username: 'alice' },
      description: 'Sharing my story',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
