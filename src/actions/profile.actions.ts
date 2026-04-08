'use server';

import prisma from '@/lib/prisma';
import { getAuthSession } from '@/lib/auth';

export type ProfileBadge = {
  id: string;
  name: string;
  description: string;
  iconName: string;
};

export type UserProfileData = {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'LECTURER' | 'ADMIN';
  reputationPoints: number;
  stats: {
    questions: number;
    answers: number;
    votes: number;
  };
  badges: ProfileBadge[];
};

const DYNAMIC_BADGES: Array<{
  key: string;
  name: string;
  description: string;
  iconName: string;
  when: (stats: UserProfileData['stats']) => boolean;
}> = [
  {
    key: 'beginner',
    name: 'Beginner',
    description: 'Asked at least one question.',
    iconName: 'CircleHelp',
    when: (stats) => stats.questions >= 1,
  },
  {
    key: 'contributor',
    name: 'Contributor',
    description: 'Provided at least 5 answers.',
    iconName: 'Handshake',
    when: (stats) => stats.answers >= 5,
  },
  {
    key: 'popular',
    name: 'Popular',
    description: 'Reached at least 25 total vote points.',
    iconName: 'Star',
    when: (stats) => stats.votes >= 25,
  },
  {
    key: 'expert',
    name: 'Expert',
    description: 'Reached 20 answers and 100 vote points.',
    iconName: 'Trophy',
    when: (stats) => stats.answers >= 20 && stats.votes >= 100,
  },
];

const LEGACY_BADGE_ICON_MAP: Record<string, string> = {
  'beta tester': 'Star',
  'verified educator': 'GraduationCap',
  scholar: 'Medal',
  legend: 'Crown',
};

export async function getUserProfileData(): Promise<UserProfileData> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      points: true,
      badges: true,
      questions: {
        select: {
          upvotes: true,
        },
      },
      answers: {
        select: {
          upvotes: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const questionsCount = user.questions.length;
  const answersCount = user.answers.length;
  const questionVotePoints = user.questions.reduce((sum, q) => sum + q.upvotes, 0);
  const answerVotePoints = user.answers.reduce((sum, a) => sum + a.upvotes, 0);
  const votePoints = questionVotePoints + answerVotePoints;

  const stats = {
    questions: questionsCount,
    answers: answersCount,
    votes: votePoints,
  };

  const dynamicBadges: ProfileBadge[] = DYNAMIC_BADGES.filter((badge) => badge.when(stats)).map(
    (badge) => ({
      id: `dynamic-${badge.key}`,
      name: badge.name,
      description: badge.description,
      iconName: badge.iconName,
    })
  );

  const storedBadges: ProfileBadge[] = user.badges.map((badge, index) => {
    const normalized = badge.toLowerCase();
    return {
      id: `stored-${index}`,
      name: badge,
      description: 'Awarded from account achievements.',
      iconName: LEGACY_BADGE_ICON_MAP[normalized] ?? 'Award',
    };
  });

  const mergedBadges = [...dynamicBadges, ...storedBadges].filter(
    (badge, index, list) => list.findIndex((other) => other.name === badge.name) === index
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    reputationPoints: user.points,
    stats,
    badges: mergedBadges,
  };
}
