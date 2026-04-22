import Link from 'next/link';
import { getMyQuestions } from '@/actions/qna.actions';
import { getAuthSession } from '@/lib/auth';

function parseTags(value: string | string[]) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value || '[]') as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

export default async function StudentMyQuestionsPage() {
  const session = await getAuthSession();
  const myQuestions = session?.user?.id ? await getMyQuestions() : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-5xl font-bold">My Questions</h1>
        <Link
          href="/ask"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Ask New
        </Link>
      </div>

      <div className="space-y-4">
        {myQuestions.length === 0 ? (
          <div className="card-shell p-6 text-slate-300">
            You have not posted any questions yet.
          </div>
        ) : (
          myQuestions.map((question) => (
            <article key={question.id} className="card-shell rounded-2xl p-5">
              <Link href={`/qna/${question.id}`}>
                <h2 className="text-2xl font-semibold text-slate-100 hover:text-blue-300 transition-colors">
                  {question.title}
                </h2>
              </Link>
              <p className="mt-2 text-slate-400">
                {question.upvotes} upvotes • {question.answers.length} answers •{' '}
                {parseTags(question.tags).join(', ')}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
