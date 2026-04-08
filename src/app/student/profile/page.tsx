import { getUserProfileData } from '@/actions/profile.actions';
import {
  Award,
  BookOpen,
  Brain,
  CircleHelp,
  Handshake,
  Mail,
  MessageCircle,
  Star,
  ThumbsUp,
  Trophy,
} from 'lucide-react';

const badgeIconMap = {
  CircleHelp,
  Brain,
  Handshake,
  Star,
  BookOpen,
  Trophy,
};

export default async function StudentProfilePage() {
  const profile = await getUserProfileData();
  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const recentActivity = [
    {
      title: 'Asked a question',
      detail: 'SOLID principles with examples',
      when: '2 days ago',
      icon: CircleHelp,
    },
    {
      title: 'Answered a question',
      detail: 'TCP vs UDP differences',
      when: '3 days ago',
      icon: MessageCircle,
    },
    {
      title: 'Earned a badge',
      detail: profile.badges[0]?.name ?? 'Top Contributor',
      when: '5 days ago',
      icon: Award,
    },
    {
      title: 'Received upvotes',
      detail: `${profile.stats.votes} total votes so far`,
      when: '1 week ago',
      icon: ThumbsUp,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 md:px-8">
      <section className="card-shell rounded-2xl p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-700 text-4xl font-semibold text-white">
            {initials}
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-slate-100">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              <span className="rounded-full bg-blue-600/30 px-3 py-1 text-blue-200">
                {profile.role === 'LECTURER' ? 'Lecturer' : 'Student'}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Mail className="h-3.5 w-3.5" />
                {profile.email}
              </span>
            </div>

            <p className="inline-flex items-center gap-2 text-2xl font-semibold text-orange-400">
              <Award className="h-5 w-5" />
              {profile.reputationPoints} Reputation Points
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card-shell rounded-2xl p-6 text-center">
          <CircleHelp className="mx-auto h-6 w-6 text-blue-500" />
          <p className="mt-2 text-5xl font-bold">{profile.stats.questions}</p>
          <p className="text-xl text-slate-400">Questions</p>
        </article>

        <article className="card-shell rounded-2xl p-6 text-center">
          <MessageCircle className="mx-auto h-6 w-6 text-blue-500" />
          <p className="mt-2 text-5xl font-bold">{profile.stats.answers}</p>
          <p className="text-xl text-slate-400">Answers</p>
        </article>

        <article className="card-shell rounded-2xl p-6 text-center">
          <ThumbsUp className="mx-auto h-6 w-6 text-blue-500" />
          <p className="mt-2 text-5xl font-bold">{profile.stats.votes}</p>
          <p className="text-xl text-slate-400">Votes</p>
        </article>
      </section>

      <section className="card-shell rounded-2xl p-6">
        <h2 className="mb-4 text-4xl font-bold">Earned Badges</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {profile.badges.map((badge) => {
            const Icon = badgeIconMap[badge.iconName as keyof typeof badgeIconMap] ?? Award;

            return (
              <article key={badge.id} className="rounded-xl bg-slate-800/80 p-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-orange-400" />
                  <p className="text-xl font-semibold text-slate-100">{badge.name}</p>
                </div>
                <p className="mt-1 text-sm text-slate-400">{badge.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card-shell rounded-2xl p-6">
        <h2 className="mb-4 text-4xl font-bold">Recent Activity</h2>
        <div className="divide-y divide-slate-800">
          {recentActivity.map((activity, index) => (
            <div key={`${activity.title}-${index}`} className="flex items-center gap-3 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                <activity.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-100">{activity.title}</p>
                <p className="text-sm text-slate-400">
                  {activity.detail} · {activity.when}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
