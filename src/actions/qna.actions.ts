// src/actions/qna.actions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';

// ==========================================
// 1. SMART DUPLICATE DETECTION (REAL DB QUERY)
// ==========================================
// export async function checkSimilarQuestions(title: string) {
//   if (!title || title.trim().length < 10) return [];

//   // 1. Sanitize and Extract Keywords
//   const stopWords = ['how', 'to', 'what', 'is', 'the', 'a', 'an', 'for', 'in', 'of', 'and', 'when', 'do', 'we'];

//   const keywords = title
//     .toLowerCase()
//     .replace(/[^a-z0-9\s]/g, ' ') // Remove punctuation
//     .split(' ')
//     .filter(word => word.length > 2 && !stopWords.includes(word)); // Keep meaningful words

//   if (keywords.length === 0) return [];

//   // 2. Query PostgreSQL for any title containing these keywords
//   const similar = await prisma.question.findMany({
//     where: {
//       OR: keywords.map(keyword => ({
//         title: { contains: keyword, mode: 'insensitive' }
//       }))
//     },
//     select: { id: true, title: true, upvotes: true },
//     take: 5 // Only suggest the top 5 matches
//   });

//   return similar;
// }

export async function checkSimilarQuestions(title: string) {
  if (!title || title.trim().length < 10) return [];

  // 1. Stop words
  const stopWords = [
    'how',
    'to',
    'what',
    'is',
    'the',
    'a',
    'an',
    'for',
    'in',
    'of',
    'and',
    'when',
    'do',
    'we',
  ];

  // 2. Synonyms (simple but powerful)
  const synonyms: Record<string, string[]> = {
    login: ['signin', 'sign', 'log'],
    error: ['issue', 'problem', 'bug'],
    deploy: ['deployment', 'release'],
  };

  // 3. Clean + tokenize
  const baseKeywords = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(' ')
    .filter((word) => word.length > 2 && !stopWords.includes(word));

  if (baseKeywords.length === 0) return [];

  // 4. Expand with synonyms
  const keywords = baseKeywords.flatMap((k) => [k, ...(synonyms[k] || [])]);

  // 5. Get candidate questions (broad match first)
  const candidates = await prisma.question.findMany({
    select: {
      id: true,
      title: true,
      upvotes: true,
    },
  });

  // 6. Score each question
  const scored = candidates.map((q) => {
    const titleWords = q.title.toLowerCase().split(/\s+/);

    let matchCount = 0;

    keywords.forEach((k) => {
      if (titleWords.includes(k)) {
        matchCount++;
      }
    });

    // Weighted score
    const score = matchCount + q.upvotes * 0.1;

    return {
      ...q,
      score,
    };
  });

  // 7. Filter + sort
  return scored
    .filter((q) => q.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// ==========================================
// 2. CREATE QUESTION (REAL DB MUTATION)
// ==========================================
export async function createQuestion(data: {
  title: string;
  content: string;
  tags: string[];
  bounty: number;
  moduleId: string;
  authorId: string;
}) {
  try {
    // 1. Find the actual Module ID and User ID from the database based on the codes
    const moduleRecord = await prisma.module.findUnique({ where: { code: data.moduleId } });
    const author = await prisma.user.findUnique({ where: { email: data.authorId } });

    if (!moduleRecord || !author) {
      return { success: false, message: 'Invalid module or user.' };
    }

    // 2. Create the question in Supabase
    const newQuestion = await prisma.question.create({
      data: {
        title: data.title,
        content: data.content,
        tags: data.tags,
        bounty: data.bounty,
        moduleId: moduleRecord.id, // Use the real DB ID
        authorId: author.id, // Use the real DB ID
      },
    });

    // 3. Tell Next.js to clear the cache so the feed updates instantly
    revalidatePath('/qna');
    return { success: true, id: newQuestion.id };
  } catch (error) {
    console.error('Failed to create question:', error);
    return { success: false, message: 'Database error.' };
  }
}

// ==========================================
// 3. GET RANKED FEED (REAL DB QUERY)
// ==========================================
export async function getRankedQuestions() {
  const questions = await prisma.question.findMany({
    include: {
      author: true,
      module: true,
      answers: { include: { author: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Sort by Upvotes + Bounty
  return questions.sort((a, b) => {
    const scoreA = a.upvotes * 2 + a.bounty * 5;
    const scoreB = b.upvotes * 2 + b.bounty * 5;
    return scoreB - scoreA;
  });
}

// ==========================================
// 4. GET ALL MODULES (For Dropdown)
// ==========================================
export async function getModules() {
  return await prisma.module.findMany({
    orderBy: { name: 'asc' },
  });
}

// ==========================================
// 5. GET SINGLE QUESTION DETAIL
// ==========================================
export async function getQuestionById(id: string) {
  return await prisma.question.findUnique({
    where: { id },
    include: {
      author: true,
      module: true,
      answers: {
        include: { author: true },
        orderBy: { upvotes: 'desc' }, // Sort answers by upvotes naturally
      },
    },
  });
}

export type RankedQuestion = Prisma.QuestionGetPayload<{
  include: {
    author: true;
    module: true;
    answers: { include: { author: true } };
  };
}>;

export type QuestionDetail = Prisma.QuestionGetPayload<{
  include: {
    author: true;
    module: true;
    answers: {
      include: { author: true };
    };
  };
}>;

export type QnaModule = Awaited<ReturnType<typeof getModules>>[number];
