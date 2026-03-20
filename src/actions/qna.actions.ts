type SimilarQuestion = {
  id: string;
  title: string;
  upvotes: number;
  score: number;
};

type CreateQuestionInput = {
  title: string;
  content: string;
  tags: string[];
  bounty: number;
  moduleId: string;
  authorId: string;
};

type ActionResult = {
  success: boolean;
  message: string;
  id?: string;
};

type QuestionRecord = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  bounty: number;
  moduleCode: string;
  authorEmail: string;
};

const inMemoryQuestions: QuestionRecord[] = [
  {
    id: 'q-itpm-1',
    title: 'When is the final ITPM Project Submission?',
    content: 'Does anyone know the exact deadline for the final 6-week sprint deployment?',
    tags: ['deadline', 'deployment', 'itpm'],
    upvotes: 2,
    bounty: 50,
    moduleCode: 'IT3040',
    authorEmail: 'sams@student.sliit.lk',
  },
  {
    id: 'q-itpm-2',
    title: 'How do we deploy the final assignment?',
    content: 'Are we supposed to use Vercel or Render for the deployment?',
    tags: ['deployment', 'vercel'],
    upvotes: 10,
    bounty: 0,
    moduleCode: 'IT3040',
    authorEmail: 'kamal@student.sliit.lk',
  },
  {
    id: 'q-dsa-1',
    title: 'Help with Python Pandas assignment',
    content: 'I keep getting a KeyError when merging two dataframes. Any tips?',
    tags: ['python', 'pandas', 'error'],
    upvotes: 0,
    bounty: 20,
    moduleCode: 'IT3010',
    authorEmail: 'sams@student.sliit.lk',
  },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(' ')
    .filter((t) => t.length > 2);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let overlap = 0;
  a.forEach((token) => {
    if (b.has(token)) overlap += 1;
  });
  return overlap / (a.size + b.size - overlap);
}

function rankSimilarity(queryTitle: string, question: QuestionRecord): number {
  const queryTokens = new Set(tokenize(queryTitle));
  const titleTokens = new Set(tokenize(question.title));
  const contentTokens = new Set(tokenize(question.content));

  const titleScore = jaccard(queryTokens, titleTokens);
  const contentScore = jaccard(queryTokens, contentTokens);

  const exactPhraseBoost = normalize(question.title).includes(normalize(queryTitle)) ? 0.2 : 0;
  const popularityBoost = Math.min(question.upvotes / 100, 0.1);
  const bountyBoost = Math.min(question.bounty / 500, 0.1);

  return titleScore * 0.6 + contentScore * 0.2 + popularityBoost + bountyBoost + exactPhraseBoost;
}

export async function checkSimilarQuestions(title: string): Promise<SimilarQuestion[]> {
  if (title.trim().length < 10) {
    return [];
  }

  const ranked = inMemoryQuestions
    .map((q) => ({
      id: q.id,
      title: q.title,
      upvotes: q.upvotes,
      score: rankSimilarity(title, q),
    }))
    .filter((q) => q.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return ranked;
}

export async function createQuestion(input: CreateQuestionInput): Promise<ActionResult> {
  if (input.title.trim().length < 10) {
    return {
      success: false,
      message: 'Question title must be at least 10 characters.',
    };
  }

  if (input.content.trim().length < 20) {
    return {
      success: false,
      message: 'Question details must be at least 20 characters.',
    };
  }

  const nextId = `q-user-${Date.now()}`;

  inMemoryQuestions.unshift({
    id: nextId,
    title: input.title.trim(),
    content: input.content.trim(),
    tags: input.tags.filter(Boolean),
    upvotes: 0,
    bounty: Math.max(0, input.bounty),
    moduleCode: input.moduleId,
    authorEmail: input.authorId,
  });

  return {
    success: true,
    message: 'Question submitted successfully.',
    id: nextId,
  };
}
