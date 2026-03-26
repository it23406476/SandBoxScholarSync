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
      badges: JSON.stringify(['Beta Tester']),
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
      badges: JSON.stringify(['Verified Educator']),
    },
  });

  // 4. Create Multiple Questions to Test "Smart Search" and "Ranking"

  // Question A: The original one (High Bounty)
  const q1 = await prisma.question.create({
    data: {
      title: 'When is the final ITPM Project Submission?',
      content: 'Does anyone know the exact deadline for the final 6-week sprint deployment?',
      tags: JSON.stringify(['deadline', 'deployment', 'itpm']),
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
      tags: JSON.stringify(['deployment', 'vercel']),
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
      tags: JSON.stringify(['python', 'pandas', 'error']),
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

  // 6. Create Dummy Community Posts
  const post1 = await prisma.post.create({
    data: {
      title: 'React Best Practices for 2024',
      content: 'I wanted to share some React best practices I learned recently. Using hooks properly, managing state efficiently, and avoiding unnecessary re-renders are key concepts that improved my performance significantly.',
      category: 'technology',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
      authorId: student1.id,
      attachments: JSON.stringify([]),
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Database Design Fundamentals',
      content: 'Understanding normalization, relationships, and indexing is crucial for building scalable applications. In this article, I break down the fundamental concepts of relational database design with practical examples.',
      category: 'database',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=600&h=400&fit=crop',
      authorId: lecturer.id,
      attachments: JSON.stringify([]),
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: 'Getting Started with TypeScript',
      content: 'TypeScript has changed the way I write JavaScript. The type safety it provides catches bugs before they reach production. Here are some tips for beginners transitioning from JavaScript to TypeScript.',
      category: 'programming',
      imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
      authorId: student2.id,
      attachments: JSON.stringify([]),
    },
  });

  const post4 = await prisma.post.create({
    data: {
      title: 'Cybersecurity in Modern Applications',
      content: 'Security should not be an afterthought. From implementing OAuth to preventing SQL injection, here\'s a comprehensive guide to securing your web applications.',
      category: 'security',
      imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f70d504d0?w=600&h=400&fit=crop',
      authorId: lecturer.id,
      attachments: JSON.stringify([]),
    },
  });

  // 7. Create Comments on Posts
  const comment1 = await prisma.comment.create({
    data: {
      content: 'This is exactly what I needed! Thanks for the clear explanation.',
      authorId: student2.id,
      postId: post1.id,
    },
  });

  const comment2 = await prisma.comment.create({
    data: {
      content: 'Great article! Do you have any recommendations for state management libraries?',
      authorId: student1.id,
      postId: post1.id,
    },
  });

  const comment3 = await prisma.comment.create({
    data: {
      content: 'I would recommend Redux for larger projects, or Zustand for simpler cases.',
      authorId: lecturer.id,
      postId: post1.id,
    },
  });

  const comment4 = await prisma.comment.create({
    data: {
      content: 'Excellent breakdown of database fundamentals. Very helpful for my project!',
      authorId: student2.id,
      postId: post2.id,
    },
  });

  const comment5 = await prisma.comment.create({
    data: {
      content: 'Could you elaborate more on index optimization?',
      authorId: student1.id,
      postId: post2.id,
    },
  });

  const comment6 = await prisma.comment.create({
    data: {
      content: 'TypeScript definitely has a learning curve, but it\'s worth the investment!',
      authorId: lecturer.id,
      postId: post3.id,
    },
  });

  // 8. Create Likes on Posts
  await prisma.like.create({
    data: {
      userId: student1.id,
      postId: post2.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: student2.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: lecturer.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: student1.id,
      postId: post3.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: student2.id,
      postId: post4.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: lecturer.id,
      postId: post3.id,
    },
  });

  // Update post like and comment counts
  await prisma.post.update({
    where: { id: post1.id },
    data: { likeCount: 2, commentCount: 3 },
  });

  await prisma.post.update({
    where: { id: post2.id },
    data: { likeCount: 1, commentCount: 2 },
  });

  await prisma.post.update({
    where: { id: post3.id },
    data: { likeCount: 2, commentCount: 1 },
  });

  await prisma.post.update({
    where: { id: post4.id },
    data: { likeCount: 1, commentCount: 0 },
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
