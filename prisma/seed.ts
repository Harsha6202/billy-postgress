import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.question.deleteMany();
  await prisma.report.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create default users
  const adminUser = await prisma.user.create({
    data: {
      username: 'Admin',
      email: 'admin@gmail.com',
      password: bcrypt.hashSync('Admin@6202', 10),
      isAdmin: true,
    },
  });

  const cybercrimeUser = await prisma.user.create({
    data: {
      username: 'Cybercrime Officer',
      email: 'cybercrime@gmail.com',
      password: bcrypt.hashSync('Cyber@6202', 10),
      isAdmin: true,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      username: 'John Doe',
      email: 'john@example.com',
      password: bcrypt.hashSync('password123', 10),
      isAdmin: false,
    },
  });

  console.log('👥 Created users');

  // Create sample reports
  const sampleReports = [
    {
      userId: regularUser.id,
      name: 'John Doe',
      age: 25,
      location: {
        lat: 19.0760,
        lng: 72.8777,
        address: 'Mumbai, Maharashtra, India',
        state: 'Maharashtra',
        district: 'Mumbai',
        city: 'Mumbai'
      },
      bullyingType: 'Harassment',
      perpetratorInfo: {
        platform: 'Instagram',
        username: 'bully_user123',
        profileUrl: 'https://instagram.com/bully_user123'
      },
      evidenceLinks: ['https://example.com/evidence1.jpg'],
      status: 'pending',
      severity: 'medium',
      isAnonymous: false,
      description: 'Continuous harassment on social media platform'
    },
    {
      userId: regularUser.id,
      name: 'Anonymous',
      age: 17,
      location: {
        lat: 28.6139,
        lng: 77.2090,
        address: 'New Delhi, Delhi, India',
        state: 'Delhi',
        district: 'New Delhi',
        city: 'New Delhi'
      },
      bullyingType: 'Cyberstalking',
      perpetratorInfo: {
        platform: 'Facebook',
        username: 'stalker_profile'
      },
      evidenceLinks: ['https://example.com/evidence2.jpg', 'https://example.com/evidence3.jpg'],
      status: 'reported',
      severity: 'high',
      isAnonymous: true,
      description: 'Being followed and monitored online'
    }
  ];

  for (const reportData of sampleReports) {
    await prisma.report.create({
      data: reportData
    });
  }

  console.log('📊 Created sample reports');

  // Create sample questions
  const sampleQuestion = await prisma.question.create({
    data: {
      userId: regularUser.id,
      username: 'John Doe',
      title: 'How to deal with online harassment?',
      content: 'I am facing continuous harassment on social media. What steps should I take?',
      status: 'approved',
      isAnonymous: false
    }
  });

  // Create sample answer
  await prisma.answer.create({
    data: {
      questionId: sampleQuestion.id,
      userId: adminUser.id,
      username: 'Admin',
      content: 'First, document all evidence by taking screenshots. Then block the harasser and report them to the platform. If it continues, consider reporting to cybercrime authorities.',
      isAnonymous: false,
      isAdminResponse: true
    }
  });

  console.log('❓ Created sample Q&A');

  // Create sample experience
  const sampleExperience = await prisma.experience.create({
    data: {
      userId: regularUser.id,
      title: 'How I Overcame Cyberbullying',
      content: 'I want to share my story of how I dealt with cyberbullying and came out stronger. It was a difficult journey, but with the right support and strategies, I was able to overcome it.',
      tags: ['recovery', 'support', 'success-story'],
      status: 'approved',
      likes: 5,
      isAnonymous: false
    }
  });

  // Create sample comment
  await prisma.comment.create({
    data: {
      experienceId: sampleExperience.id,
      userId: adminUser.id,
      username: 'Admin',
      content: 'Thank you for sharing your inspiring story. It will help many others who are going through similar experiences.',
      isAnonymous: false,
      likes: 2
    }
  });

  console.log('📝 Created sample experiences and comments');

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Default Accounts:');
  console.log('👨‍💼 Admin: admin@gmail.com / Admin@6202');
  console.log('🚔 Cybercrime: cybercrime@gmail.com / Cyber@6202');
  console.log('👤 User: john@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });