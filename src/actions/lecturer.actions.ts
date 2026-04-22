'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';
import { getLecturerAssignedQuestions, type RankedQuestion } from '@/actions/qna.actions';

type ActionError = { success: false; message: string };
type ActionSuccess<T> = { success: true; data: T; message?: string };
type ActionResult<T> = ActionSuccess<T> | ActionError;

type LecturerSession = {
  id: string;
  role: 'LECTURER' | 'ADMIN';
};

const MODULE_CODE_REGEX = /^[A-Z]{2,4}\d{3,4}$/;
const MODULE_NAME_REGEX = /^[A-Za-z0-9&(),./\-\s]{3,100}$/;

function normalizeModuleCode(code: string) {
  return code.trim().toUpperCase();
}

function normalizeModuleName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

async function getLecturerSession(): Promise<LecturerSession | null> {
  const session = await getAuthSession();
  const role = session?.user?.role;

  if (!session?.user?.id || (role !== 'LECTURER' && role !== 'ADMIN')) {
    return null;
  }

  return {
    id: session.user.id,
    role,
  };
}

async function getAssignedModuleIds(lecturerId: string) {
  const assignments = await prisma.lecturerModuleAssignment.findMany({
    where: { lecturerId },
    select: { moduleId: true },
  });

  return assignments.map((assignment) => assignment.moduleId);
}

function getWeekStartKey(value: Date) {
  const date = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  const day = date.getUTCDay();
  const offset = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
}

export type LecturerAnswerRateData = {
  totalAssignedQuestions: number;
  answeredByLecturer: number;
  unansweredAssignedQuestions: number;
  answerRatePercent: number;
  byModule: Array<{
    moduleId: string;
    moduleCode: string;
    moduleName: string;
    totalQuestions: number;
    answeredQuestions: number;
    answerRatePercent: number;
  }>;
};

export type LecturerAnalyticsData = {
  questionsPerModule: Array<{
    moduleId: string;
    moduleCode: string;
    moduleName: string;
    questionCount: number;
  }>;
  participationTrend: Array<{
    weekStart: string;
    questions: number;
    answers: number;
    total: number;
  }>;
  popularTags: Array<{
    tag: string;
    count: number;
  }>;
  topContributors: Array<{
    userId: string;
    name: string;
    role: 'STUDENT' | 'LECTURER' | 'ADMIN';
    questionsCount: number;
    answersCount: number;
    totalContributions: number;
  }>;
};

export type LecturerDashboardData = {
  modulesCount: number;
  assignedModules: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  assignedQuestionsCount: number;
  answeredQuestionsCount: number;
  pendingQuestionsCount: number;
  recentAssignedQuestions: RankedQuestion[];
};

export async function getLecturerAnswerRateData(): Promise<ActionResult<LecturerAnswerRateData>> {
  const lecturer = await getLecturerSession();
  if (!lecturer) {
    return { success: false, message: 'Unauthorized. Lecturer access required.' };
  }

  const assignedModuleIds = await getAssignedModuleIds(lecturer.id);

  if (assignedModuleIds.length === 0) {
    return {
      success: true,
      data: {
        totalAssignedQuestions: 0,
        answeredByLecturer: 0,
        unansweredAssignedQuestions: 0,
        answerRatePercent: 0,
        byModule: [],
      },
    };
  }

  const questions = await prisma.question.findMany({
    where: {
      moduleId: { in: assignedModuleIds },
    },
    select: {
      id: true,
      moduleId: true,
      module: {
        select: {
          id: true,
          code: true,
          name: true,
        },
      },
      answers: {
        where: { authorId: lecturer.id },
        select: { id: true },
        take: 1,
      },
    },
  });

  const totalAssignedQuestions = questions.length;
  const answeredByLecturer = questions.filter((question) => question.answers.length > 0).length;
  const unansweredAssignedQuestions = totalAssignedQuestions - answeredByLecturer;
  const answerRatePercent =
    totalAssignedQuestions === 0
      ? 0
      : Math.round((answeredByLecturer / totalAssignedQuestions) * 10000) / 100;

  const moduleMap = new Map<
    string,
    {
      moduleId: string;
      moduleCode: string;
      moduleName: string;
      totalQuestions: number;
      answeredQuestions: number;
    }
  >();

  for (const question of questions) {
    const current = moduleMap.get(question.moduleId) ?? {
      moduleId: question.module.id,
      moduleCode: question.module.code,
      moduleName: question.module.name,
      totalQuestions: 0,
      answeredQuestions: 0,
    };

    current.totalQuestions += 1;
    if (question.answers.length > 0) {
      current.answeredQuestions += 1;
    }

    moduleMap.set(question.moduleId, current);
  }

  const byModule = [...moduleMap.values()]
    .map((moduleStats) => ({
      ...moduleStats,
      answerRatePercent:
        moduleStats.totalQuestions === 0
          ? 0
          : Math.round((moduleStats.answeredQuestions / moduleStats.totalQuestions) * 10000) / 100,
    }))
    .sort((a, b) => b.totalQuestions - a.totalQuestions);

  return {
    success: true,
    data: {
      totalAssignedQuestions,
      answeredByLecturer,
      unansweredAssignedQuestions,
      answerRatePercent,
      byModule,
    },
  };
}

export async function getLecturerAnalyticsData(): Promise<ActionResult<LecturerAnalyticsData>> {
  const lecturer = await getLecturerSession();
  if (!lecturer) {
    return { success: false, message: 'Unauthorized. Lecturer access required.' };
  }

  const assignedModuleIds = await getAssignedModuleIds(lecturer.id);

  if (assignedModuleIds.length === 0) {
    return {
      success: true,
      data: {
        questionsPerModule: [],
        participationTrend: [],
        popularTags: [],
        topContributors: [],
      },
    };
  }

  const [questions, answers] = await Promise.all([
    prisma.question.findMany({
      where: {
        moduleId: { in: assignedModuleIds },
      },
      select: {
        id: true,
        moduleId: true,
        tags: true,
        authorId: true,
        createdAt: true,
        module: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    }),
    prisma.answer.findMany({
      where: {
        question: {
          moduleId: { in: assignedModuleIds },
        },
      },
      select: {
        id: true,
        authorId: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    }),
  ]);

  const questionsPerModuleMap = new Map<
    string,
    {
      moduleId: string;
      moduleCode: string;
      moduleName: string;
      questionCount: number;
    }
  >();

  for (const question of questions) {
    const current = questionsPerModuleMap.get(question.moduleId) ?? {
      moduleId: question.module.id,
      moduleCode: question.module.code,
      moduleName: question.module.name,
      questionCount: 0,
    };

    current.questionCount += 1;
    questionsPerModuleMap.set(question.moduleId, current);
  }

  const questionsPerModule = [...questionsPerModuleMap.values()].sort(
    (a, b) => b.questionCount - a.questionCount
  );

  const tagMap = new Map<string, number>();
  for (const question of questions) {
    for (const tag of question.tags) {
      const normalizedTag = tag.trim().toLowerCase();
      if (!normalizedTag) continue;
      tagMap.set(normalizedTag, (tagMap.get(normalizedTag) ?? 0) + 1);
    }
  }

  const popularTags = [...tagMap.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const contributorMap = new Map<
    string,
    {
      userId: string;
      name: string;
      role: 'STUDENT' | 'LECTURER' | 'ADMIN';
      questionsCount: number;
      answersCount: number;
    }
  >();

  for (const question of questions) {
    const current = contributorMap.get(question.authorId) ?? {
      userId: question.author.id,
      name: question.author.name,
      role: question.author.role,
      questionsCount: 0,
      answersCount: 0,
    };

    current.questionsCount += 1;
    contributorMap.set(question.authorId, current);
  }

  for (const answer of answers) {
    const current = contributorMap.get(answer.authorId) ?? {
      userId: answer.author.id,
      name: answer.author.name,
      role: answer.author.role,
      questionsCount: 0,
      answersCount: 0,
    };

    current.answersCount += 1;
    contributorMap.set(answer.authorId, current);
  }

  const topContributors = [...contributorMap.values()]
    .map((contributor) => ({
      ...contributor,
      totalContributions: contributor.questionsCount + contributor.answersCount,
    }))
    .sort((a, b) => b.totalContributions - a.totalContributions)
    .slice(0, 10);

  const trendMap = new Map<string, { questions: number; answers: number }>();

  const now = new Date();
  const last8Weeks = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - (7 - index) * 7);
    return getWeekStartKey(date);
  });

  for (const weekKey of last8Weeks) {
    trendMap.set(weekKey, { questions: 0, answers: 0 });
  }

  for (const question of questions) {
    const weekKey = getWeekStartKey(question.createdAt);
    if (!trendMap.has(weekKey)) continue;
    const current = trendMap.get(weekKey);
    if (!current) continue;
    current.questions += 1;
    trendMap.set(weekKey, current);
  }

  for (const answer of answers) {
    const weekKey = getWeekStartKey(answer.createdAt);
    if (!trendMap.has(weekKey)) continue;
    const current = trendMap.get(weekKey);
    if (!current) continue;
    current.answers += 1;
    trendMap.set(weekKey, current);
  }

  const participationTrend = [...trendMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, counts]) => ({
      weekStart,
      questions: counts.questions,
      answers: counts.answers,
      total: counts.questions + counts.answers,
    }));

  return {
    success: true,
    data: {
      questionsPerModule,
      participationTrend,
      popularTags,
      topContributors,
    },
  };
}

export async function getLecturerDashboardData(): Promise<ActionResult<LecturerDashboardData>> {
  const lecturer = await getLecturerSession();
  if (!lecturer) {
    return { success: false, message: 'Unauthorized. Lecturer access required.' };
  }

  const [assignedModules, assignedQuestions] = await Promise.all([
    prisma.module.findMany({
      where: {
        lecturerAssignments: {
          some: { lecturerId: lecturer.id },
        },
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: [{ code: 'asc' }],
    }),
    getLecturerAssignedQuestions(),
  ]);

  const answeredQuestionsCount = assignedQuestions.filter((question) =>
    question.answers.some((answer) => answer.authorId === lecturer.id)
  ).length;

  const assignedQuestionsCount = assignedQuestions.length;
  const pendingQuestionsCount = assignedQuestionsCount - answeredQuestionsCount;

  const recentAssignedQuestions = [...assignedQuestions]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 8);

  return {
    success: true,
    data: {
      modulesCount: assignedModules.length,
      assignedModules,
      assignedQuestionsCount,
      answeredQuestionsCount,
      pendingQuestionsCount,
      recentAssignedQuestions,
    },
  };
}

type CreateModuleInput = {
  code: string;
  name: string;
  healthReportUrl?: string;
};

export async function createModuleAction(
  input: CreateModuleInput
): Promise<ActionResult<{ id: string; code: string; name: string }>> {
  const lecturer = await getLecturerSession();
  if (!lecturer) {
    return { success: false, message: 'Unauthorized. Lecturer access required.' };
  }

  const code = normalizeModuleCode(input.code);
  const name = normalizeModuleName(input.name);

  if (!MODULE_CODE_REGEX.test(code)) {
    return {
      success: false,
      message: 'Invalid module code format. Use uppercase code like IT3040.',
    };
  }

  if (!MODULE_NAME_REGEX.test(name)) {
    return {
      success: false,
      message: 'Invalid module name. Use 3-100 valid characters.',
    };
  }

  const existing = await prisma.module.findUnique({
    where: { code },
    select: { id: true },
  });

  if (existing) {
    return { success: false, message: 'A module with this code already exists.' };
  }

  const created = await prisma.$transaction(async (tx) => {
    const moduleRecord = await tx.module.create({
      data: {
        code,
        name,
        healthReportUrl: input.healthReportUrl?.trim() || null,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    await tx.lecturerModuleAssignment.upsert({
      where: {
        lecturerId_moduleId: {
          lecturerId: lecturer.id,
          moduleId: moduleRecord.id,
        },
      },
      update: {},
      create: {
        lecturerId: lecturer.id,
        moduleId: moduleRecord.id,
      },
    });

    return moduleRecord;
  });

  revalidatePath('/lecturer');
  revalidatePath('/modules');
  revalidatePath('/qna');

  return {
    success: true,
    data: created,
    message: 'Module created successfully.',
  };
}

type UpdateModuleInput = {
  moduleId: string;
  code: string;
  name: string;
  healthReportUrl?: string | null;
};

export async function updateModuleAction(
  input: UpdateModuleInput
): Promise<ActionResult<{ id: string; code: string; name: string }>> {
  const lecturer = await getLecturerSession();
  if (!lecturer) {
    return { success: false, message: 'Unauthorized. Lecturer access required.' };
  }

  const code = normalizeModuleCode(input.code);
  const name = normalizeModuleName(input.name);

  if (!MODULE_CODE_REGEX.test(code)) {
    return { success: false, message: 'Invalid module code format.' };
  }

  if (!MODULE_NAME_REGEX.test(name)) {
    return { success: false, message: 'Invalid module name.' };
  }

  const hasAssignment = await prisma.lecturerModuleAssignment.findUnique({
    where: {
      lecturerId_moduleId: {
        lecturerId: lecturer.id,
        moduleId: input.moduleId,
      },
    },
    select: { moduleId: true },
  });

  if (!hasAssignment) {
    return { success: false, message: 'You can only update modules assigned to you.' };
  }

  const moduleWithSameCode = await prisma.module.findUnique({
    where: { code },
    select: { id: true },
  });

  if (moduleWithSameCode && moduleWithSameCode.id !== input.moduleId) {
    return { success: false, message: 'Module code is already in use.' };
  }

  const updated = await prisma.module.update({
    where: { id: input.moduleId },
    data: {
      code,
      name,
      healthReportUrl: input.healthReportUrl?.trim() || null,
    },
    select: {
      id: true,
      code: true,
      name: true,
    },
  });

  revalidatePath('/lecturer');
  revalidatePath('/modules');
  revalidatePath('/qna');
  revalidatePath('/ask');

  return {
    success: true,
    data: updated,
    message: 'Module updated successfully.',
  };
}

export async function deleteModuleAction(
  moduleId: string
): Promise<ActionResult<{ deletedModuleId: string }>> {
  const lecturer = await getLecturerSession();
  if (!lecturer) {
    return { success: false, message: 'Unauthorized. Lecturer access required.' };
  }

  const hasAssignment = await prisma.lecturerModuleAssignment.findUnique({
    where: {
      lecturerId_moduleId: {
        lecturerId: lecturer.id,
        moduleId,
      },
    },
    select: { moduleId: true },
  });

  if (!hasAssignment) {
    return { success: false, message: 'You can only delete modules assigned to you.' };
  }

  const questionCount = await prisma.question.count({
    where: { moduleId },
  });

  if (questionCount > 0) {
    return {
      success: false,
      message:
        'Cannot delete this module because it is linked to existing questions. Reassign questions first.',
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.lecturerModuleAssignment.deleteMany({ where: { moduleId } });
    await tx.module.delete({ where: { id: moduleId } });
  });

  revalidatePath('/lecturer');
  revalidatePath('/modules');
  revalidatePath('/qna');
  revalidatePath('/ask');

  return {
    success: true,
    data: { deletedModuleId: moduleId },
    message: 'Module deleted successfully.',
  };
}

async function canLecturerManageQuestion(lecturerId: string, questionId: string) {
  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      moduleId: true,
      module: {
        select: {
          lecturerAssignments: {
            where: { lecturerId },
            select: { moduleId: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!question) {
    return { allowed: false, reason: 'Question not found.' } as const;
  }

  if (question.module.lecturerAssignments.length === 0) {
    return { allowed: false, reason: 'You are not assigned to this question module.' } as const;
  }

  return { allowed: true, question } as const;
}

export async function moveAnswerToQuestionAction(input: {
  answerId: string;
  targetQuestionId: string;
}): Promise<ActionResult<{ answerId: string; fromQuestionId: string; toQuestionId: string }>> {
  const lecturer = await getLecturerSession();
  if (!lecturer) {
    return { success: false, message: 'Unauthorized. Lecturer access required.' };
  }

  const answer = await prisma.answer.findUnique({
    where: { id: input.answerId },
    select: {
      id: true,
      questionId: true,
      question: {
        select: {
          id: true,
          moduleId: true,
        },
      },
    },
  });

  if (!answer) {
    return { success: false, message: 'Answer not found.' };
  }

  if (answer.questionId === input.targetQuestionId) {
    return { success: false, message: 'Answer is already on the target question.' };
  }

  const [sourceGuard, targetGuard] = await Promise.all([
    canLecturerManageQuestion(lecturer.id, answer.questionId),
    canLecturerManageQuestion(lecturer.id, input.targetQuestionId),
  ]);

  if (!sourceGuard.allowed) {
    return { success: false, message: sourceGuard.reason };
  }

  if (!targetGuard.allowed) {
    return { success: false, message: targetGuard.reason };
  }

  await prisma.$transaction(async (tx) => {
    await tx.answer.update({
      where: { id: input.answerId },
      data: { questionId: input.targetQuestionId },
    });
  });

  revalidatePath('/qna');
  revalidatePath(`/qna/${answer.questionId}`);
  revalidatePath(`/qna/${input.targetQuestionId}`);
  revalidatePath('/lecturer');

  return {
    success: true,
    data: {
      answerId: input.answerId,
      fromQuestionId: answer.questionId,
      toQuestionId: input.targetQuestionId,
    },
    message: 'Answer moved successfully.',
  };
}

export async function deleteAnswerAction(
  answerId: string
): Promise<ActionResult<{ answerId: string; questionId: string }>> {
  const lecturer = await getLecturerSession();
  if (!lecturer) {
    return { success: false, message: 'Unauthorized. Lecturer access required.' };
  }

  const answer = await prisma.answer.findUnique({
    where: { id: answerId },
    select: {
      id: true,
      questionId: true,
    },
  });

  if (!answer) {
    return { success: false, message: 'Answer not found.' };
  }

  const sourceGuard = await canLecturerManageQuestion(lecturer.id, answer.questionId);
  if (!sourceGuard.allowed) {
    return { success: false, message: sourceGuard.reason };
  }

  await prisma.answer.delete({
    where: { id: answerId },
  });

  revalidatePath('/qna');
  revalidatePath(`/qna/${answer.questionId}`);
  revalidatePath('/lecturer');

  return {
    success: true,
    data: {
      answerId,
      questionId: answer.questionId,
    },
    message: 'Answer deleted successfully.',
  };
}

export async function updateQuestionModuleAction(input: {
  questionId: string;
  moduleId: string;
}): Promise<
  ActionResult<{ questionId: string; previousModuleId: string; updatedModuleId: string }>
> {
  const lecturer = await getLecturerSession();
  if (!lecturer) {
    return { success: false, message: 'Unauthorized. Lecturer access required.' };
  }

  const question = await prisma.question.findUnique({
    where: { id: input.questionId },
    select: {
      id: true,
      moduleId: true,
      module: {
        select: {
          lecturerAssignments: {
            where: { lecturerId: lecturer.id },
            select: { moduleId: true },
            take: 1,
          },
        },
      },
    },
  });

  if (!question) {
    return { success: false, message: 'Question not found.' };
  }

  if (question.module.lecturerAssignments.length === 0) {
    return { success: false, message: 'You are not assigned to the source module.' };
  }

  const targetModuleAssignment = await prisma.lecturerModuleAssignment.findUnique({
    where: {
      lecturerId_moduleId: {
        lecturerId: lecturer.id,
        moduleId: input.moduleId,
      },
    },
    select: { moduleId: true },
  });

  if (!targetModuleAssignment) {
    return { success: false, message: 'You are not assigned to the target module.' };
  }

  if (question.moduleId === input.moduleId) {
    return { success: false, message: 'Question is already assigned to this module.' };
  }

  await prisma.question.update({
    where: { id: input.questionId },
    data: { moduleId: input.moduleId },
  });

  revalidatePath('/qna');
  revalidatePath(`/qna/${input.questionId}`);
  revalidatePath('/lecturer');
  revalidatePath('/ask');

  return {
    success: true,
    data: {
      questionId: input.questionId,
      previousModuleId: question.moduleId,
      updatedModuleId: input.moduleId,
    },
    message: 'Question module updated successfully.',
  };
}
