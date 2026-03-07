import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database... ');

  // 1. Create Academic Modules
  const itpm = await prisma.module.upsert({
    where: { code: 'IT3040' },
    update: {},
    create: { code: 'IT3040', name: 'IT Project Management' },
  });

  await prisma.module.upsert({
    where: { code: 'IT3010' },
    update: {},
    create: { code: 'IT3010', name: 'Data Science & Analytics' },
  });

  // 2. Create Test Student
  const student = await prisma.user.upsert({
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

  // 3. Create Test Lecturer
  await prisma.user.upsert({
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

  // 4. Create a Test Question
  await prisma.question.create({
    data: {
      title: 'When is the final ITPM Project Submission?',
      content:
        'Does anyone know the exact deadline for the final 6-week sprint deployment? I need to manage my timeline.',
      tags: ['deadline', 'deployment', 'itpm'],
      bounty: 50,
      authorId: student.id,
      moduleId: itpm.id,
    },
  });

  console.log('Database seeded successfully!...');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
