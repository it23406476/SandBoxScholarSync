import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database... 🌱');

  // 1. Create Academic Modules
  const itpm = await prisma.module.upsert({
    where: { code: 'IT3040' },
    update: {},
    create: { code: 'IT3040', name: 'IT Project Management' },
  });

  const dsa = await prisma.module.upsert({
    where: { code: 'IT3010' },
    update: {},
    create: { code: 'IT3010', name: 'Data Science & Analytics' },
  });

  // 2. Create Test Students
  const student1 = await prisma.user.upsert({
    where: { email: 'sams@student.sliit.lk' },
    update: {},
    create: {
      name: 'Sams Senarath',
      email: 'sams@student.sliit.lk',
      role: 'STUDENT',
      points: 500,
      badges: ['Beta Tester'],
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'kamal@student.sliit.lk' },
    update: {},
    create: {
      name: 'Kamal Perera',
      email: 'kamal@student.sliit.lk',
      role: 'STUDENT',
      points: 200,
    },
  });

  // 3. Create Test Lecturer
  const lecturer = await prisma.user.upsert({
    where: { email: 'sarah@lecturer.sliit.lk' },
    update: {},
    create: {
      name: 'Dr. Sarah',
      email: 'sarah@lecturer.sliit.lk',
      role: 'LECTURER',
      points: 1000,
      badges: ['Verified Educator'],
    },
  });

  // 4. Create Multiple Questions to Test "Smart Search" and "Ranking"

  // Question A: The original one (High Bounty)
  const q1 = await prisma.question.create({
    data: {
      title: 'When is the final ITPM Project Submission?',
      content: 'Does anyone know the exact deadline for the final 6-week sprint deployment?',
      tags: ['deadline', 'deployment', 'itpm'],
      bounty: 50,
      upvotes: 2,
      authorId: student1.id,
      moduleId: itpm.id,
    },
  });

  // Question B: Similar keywords to test Duplicate Detection
  await prisma.question.create({
    data: {
      title: 'How do we deploy the final assignment?',
      content: 'Are we supposed to use Vercel or Render for the deployment?',
      tags: ['deployment', 'vercel'],
      bounty: 0,
      upvotes: 10, // High upvotes to test ranking
      authorId: student2.id,
      moduleId: itpm.id,
    },
  });

  // Question C: DSA Module Question
  await prisma.question.create({
    data: {
      title: 'Help with Python Pandas assignment',
      content: 'I keep getting a KeyError when merging two dataframes. Any tips?',
      tags: ['python', 'pandas', 'error'],
      bounty: 20,
      upvotes: 0,
      authorId: student1.id,
      moduleId: dsa.id,
    },
  });

  // 5. Create a Lecturer Verified Answer
  await prisma.answer.create({
    data: {
      content:
        'The final submission link will close on Friday at 11:59 PM. Please ensure your Vercel links are active.',
      upvotes: 5,
      isVerified: true, // This is what gives it the 5x multiplier in your algorithm!
      authorId: lecturer.id,
      questionId: q1.id,
    },
  });

  console.log('✅ Database seeded successfully with expanded test data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
