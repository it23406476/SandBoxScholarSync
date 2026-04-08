import { getUserProfileData } from '@/actions/profile.actions';
import Link from 'next/link';
import { CircleHelp, MessageCircle, ThumbsUp } from 'lucide-react';

export default async function StudentDashboardPage() {
  const profile = await getUserProfileData();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <div className="card-shell p-8">
        <h1 className="text-5xl font-bold">Dashboard</h1>
        <p className="mt-4 text-2xl text-slate-300">Welcome back, {profile.name}.</p>
        <p className="mt-2 text-xl text-slate-400">
          You currently have {profile.reputationPoints} reputation points.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl bg-slate-800/70 p-4 text-center">
            <CircleHelp className="mx-auto h-5 w-5 text-blue-400" />
            <p className="mt-2 text-3xl font-bold text-slate-100">{profile.stats.questions}</p>
            <p className="text-slate-400">Questions</p>
          </article>
          <article className="rounded-xl bg-slate-800/70 p-4 text-center">
            <MessageCircle className="mx-auto h-5 w-5 text-blue-400" />
            <p className="mt-2 text-3xl font-bold text-slate-100">{profile.stats.answers}</p>
            <p className="text-slate-400">Answers</p>
          </article>
          <article className="rounded-xl bg-slate-800/70 p-4 text-center">
            <ThumbsUp className="mx-auto h-5 w-5 text-blue-400" />
            <p className="mt-2 text-3xl font-bold text-slate-100">{profile.stats.votes}</p>
            <p className="text-slate-400">Vote Points</p>
          </article>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/qna"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Browse Questions
          </Link>
          <Link
            href="/student/my-questions"
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            My Questions
          </Link>
          <Link
            href="/student/badges"
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            My Badges
          </Link>
        </div>
      </div>
    </div>
  );
}
