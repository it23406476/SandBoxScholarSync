// src/actions/qna.actions.ts
'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import type { Prisma } from '@prisma/client';

function isDatabaseConnectionError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("Can't reach database server") ||
    error.message.includes('PrismaClientInitializationError')
  );
}

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

const STOP_WORDS = new Set([
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
  'with',
  'on',
  'at',
  'by',
  'from',
]);

const SYNONYMS: Record<string, string[]> = {
  login: ['signin', 'sign', 'log'],
  error: ['issue', 'problem', 'bug'],
  deploy: ['deployment', 'release'],
  deployment: ['deploy', 'release'],
  deadline: ['due', 'submission'],
  submission: ['submit', 'deadline'],
};

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function buildKeywordSet(text: string) {
  const terms = tokenize(text);
  const expanded = terms.flatMap((word) => [word, ...(SYNONYMS[word] || [])]);
  return new Set(expanded);
}

function normalizeForExactMatch(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function checkSimilarQuestions(title: string, moduleCode?: string) {
  if (!title || title.trim().length < 10) return [];

  const normalizedInput = normalizeForExactMatch(title);
  const inputTerms = buildKeywordSet(title);

  const moduleFilter = moduleCode
    ? await prisma.module.findUnique({ where: { code: moduleCode }, select: { id: true } })
    : null;

  // 1. Get candidate questions for module/global scope.
  const candidates = await prisma.question.findMany({
    where: moduleFilter
      ? {
          moduleId: moduleFilter.id,
        }
      : undefined,
    select: {
      id: true,
      title: true,
      upvotes: true,
    },
  });

  // 2. Score each question for exact and high-overlap relevance.
  const scored = candidates.map((q) => {
    const candidateTerms = buildKeywordSet(q.title);
    const intersection = [...inputTerms].filter((term) => candidateTerms.has(term)).length;
    const union = new Set([...inputTerms, ...candidateTerms]).size;
    const overlap = union > 0 ? intersection / union : 0;

    const normalizedCandidate = normalizeForExactMatch(q.title);
    const isExactMatch = normalizedInput === normalizedCandidate;

    const score = overlap * 100 + q.upvotes * 0.05 + (isExactMatch ? 100 : 0);

    return {
      ...q,
      score,
      overlap,
      intersection,
      isExactMatch,
    };
  });

  // 3. Keep only genuine similarity to avoid noisy duplicate warnings.
  return scored
    .filter((q) => q.isExactMatch || q.intersection >= 2 || q.overlap >= 0.45)
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

export async function updateQuestion(data: {
  id: string;
  title: string;
  content: string;
  tags: string[];
  bounty: number;
  authorEmail: string;
}) {
  try {
    const owner = await prisma.user.findUnique({ where: { email: data.authorEmail } });
    if (!owner) return { success: false, message: 'Invalid user.' };

    const question = await prisma.question.findUnique({ where: { id: data.id } });
    if (!question || question.authorId !== owner.id) {
      return { success: false, message: 'You are not allowed to edit this question.' };
    }

    await prisma.question.update({
      where: { id: data.id },
      data: {
        title: data.title,
        content: data.content,
        tags: data.tags,
        bounty: data.bounty,
      },
    });

    revalidatePath('/qna');
    revalidatePath(`/qna/${data.id}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update question:', error);
    return { success: false, message: 'Database error.' };
  }
}

export async function deleteQuestion(questionId: string, authorEmail: string) {
  try {
    const owner = await prisma.user.findUnique({ where: { email: authorEmail } });
    if (!owner) return { success: false, message: 'Invalid user.' };

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question || question.authorId !== owner.id) {
      return { success: false, message: 'You are not allowed to delete this question.' };
    }

    await prisma.answer.deleteMany({ where: { questionId } });
    await prisma.question.delete({ where: { id: questionId } });

    revalidatePath('/qna');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete question:', error);
    return { success: false, message: 'Database error.' };
  }
}

// ==========================================
// 3. GET RANKED FEED (REAL DB QUERY)
// ==========================================
export async function getRankedQuestions() {
  try {
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
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error('Database unreachable while loading ranked questions:', error);
      return [];
    }
    throw error;
  }
}

export async function getQuestionsByAuthorEmail(authorEmail: string) {
  try {
    const questions = await prisma.question.findMany({
      where: {
        author: {
          email: authorEmail,
        },
      },
      include: {
        author: true,
        module: true,
        answers: { include: { author: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return questions.sort((a, b) => {
      const scoreA = a.upvotes * 2 + a.bounty * 5;
      const scoreB = b.upvotes * 2 + b.bounty * 5;
      return scoreB - scoreA;
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error('Database unreachable while loading user questions:', error);
      return [];
    }
    throw error;
  }
}

// ==========================================
// 4. GET ALL MODULES (For Dropdown)
// ==========================================
export async function getModules() {
  try {
    return await prisma.module.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error('Database unreachable while loading modules:', error);
      return [];
    }
    throw error;
  }
}

// ==========================================
// 5. GET SINGLE QUESTION DETAIL
// ==========================================
export async function getQuestionById(id: string) {
  try {
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
  } catch (error) {
    if (isDatabaseConnectionError(error)) {
      console.error('Database unreachable while loading question details:', error);
      return null;
    }
    throw error;
  }
}

export async function voteQuestion(
  questionId: string,
  direction: 'up' | 'down',
  voterEmail: string
) {
  try {
    const voter = await prisma.user.findUnique({ where: { email: voterEmail } });
    if (!voter) return { success: false, message: 'Invalid user.' };

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true, authorId: true },
    });
    if (!question) return { success: false, message: 'Question not found.' };

    if (question.authorId === voter.id) {
      return { success: false, message: 'You cannot vote on your own question.' };
    }

    const targetValue = direction === 'up' ? 1 : -1;

    const payload = await prisma.$transaction(async (tx) => {
      const existingVote = await tx.vote.findUnique({
        where: {
          userId_questionId: {
            userId: voter.id,
            questionId,
          },
        },
      });

      if (!existingVote) {
        await tx.vote.create({
          data: {
            userId: voter.id,
            questionId,
            value: targetValue,
          },
        });

        const updatedQuestion = await tx.question.update({
          where: { id: questionId },
          data: { upvotes: { increment: targetValue } },
          select: { upvotes: true },
        });

        return { success: true, upvotes: updatedQuestion.upvotes, message: 'Vote recorded.' };
      }

      if (existingVote.value === targetValue) {
        const current = await tx.question.findUnique({
          where: { id: questionId },
          select: { upvotes: true },
        });
        return {
          success: false,
          upvotes: current?.upvotes ?? 0,
          message: 'You already cast this vote.',
        };
      }

      await tx.vote.update({
        where: {
          userId_questionId: {
            userId: voter.id,
            questionId,
          },
        },
        data: { value: targetValue },
      });

      const updatedQuestion = await tx.question.update({
        where: { id: questionId },
        data: { upvotes: { increment: targetValue * 2 } },
        select: { upvotes: true },
      });

      return {
        success: true,
        upvotes: updatedQuestion.upvotes,
        message: 'Vote updated.',
      };
    });

    revalidatePath('/qna');
    revalidatePath(`/qna/${questionId}`);
    revalidatePath('/lecturer');
    return payload;
  } catch (error) {
    console.error('Failed to vote question:', error);
    return { success: false, message: 'Database error.' };
  }
}

export async function voteAnswer(answerId: string, direction: 'up' | 'down') {
  const delta = direction === 'up' ? 1 : -1;
  const updated = await prisma.answer.update({
    where: { id: answerId },
    data: {
      upvotes: {
        increment: delta,
      },
    },
    select: {
      upvotes: true,
      questionId: true,
    },
  });

  revalidatePath(`/qna/${updated.questionId}`);
  return { success: true, upvotes: updated.upvotes };
}

export async function getLecturerAssignedQuestions(lecturerEmail: string) {
  const lecturer = await prisma.user.findUnique({
    where: { email: lecturerEmail },
    include: {
      moduleAssignments: {
        select: {
          moduleId: true,
        },
      },
    },
  });

  if (!lecturer) return [];

  const assignedModuleIds = lecturer.moduleAssignments.map((assignment) => assignment.moduleId);
  if (assignedModuleIds.length === 0) return [];

  const questions = await prisma.question.findMany({
    where: {
      moduleId: {
        in: assignedModuleIds,
      },
    },
    include: {
      author: true,
      module: true,
      answers: { include: { author: true } },
    },
  });

  return questions.sort((a, b) => b.upvotes + b.bounty - (a.upvotes + a.bounty));
}

export async function lecturerRecommendQuestion(questionId: string, lecturerEmail: string) {
  const lecturer = await prisma.user.findUnique({ where: { email: lecturerEmail } });
  if (!lecturer || lecturer.role === 'STUDENT') {
    return { success: false, message: 'Only lecturer/admin can recommend questions.' };
  }

  return voteQuestion(questionId, 'up', lecturerEmail);
}

export async function addAnswer(data: {
  questionId: string;
  content: string;
  authorEmail: string;
}) {
  try {
    const author = await prisma.user.findUnique({ where: { email: data.authorEmail } });
    if (!author) return { success: false, message: 'Invalid user.' };
    if (!data.content.trim()) return { success: false, message: 'Answer cannot be empty.' };

    await prisma.answer.create({
      data: {
        questionId: data.questionId,
        content: data.content.trim(),
        authorId: author.id,
      },
    });

    revalidatePath(`/qna/${data.questionId}`);
    revalidatePath('/qna');
    return { success: true };
  } catch (error) {
    console.error('Failed to add answer:', error);
    return { success: false, message: 'Database error.' };
  }
}

export async function getSimilarQuestionsByModule(moduleId: string, currentQuestionId: string) {
  return prisma.question.findMany({
    where: {
      moduleId,
      NOT: { id: currentQuestionId },
    },
    include: {
      author: true,
      module: true,
      answers: { include: { author: true } },
    },
    orderBy: [{ upvotes: 'desc' }, { createdAt: 'desc' }],
    take: 6,
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
