import {
  Award,
  BookOpen,
  Brain,
  GraduationCap,
  Handshake,
  Medal,
  Star,
  Trophy,
  Crown,
  CircleHelp,
} from 'lucide-react';
import { getUserProfileData } from '@/actions/profile.actions';

const badgeIconMap = {
  CircleHelp,
  Brain,
  Handshake,
  Star,
  BookOpen,
  Trophy,
  GraduationCap,
  Medal,
  Crown,
};

const pointsRules = [
  { label: 'Ask a question', points: '+5 pts' },
  { label: 'Answer accepted', points: '+15 pts' },
  { label: 'Receive upvote', points: '+10 pts' },
  { label: 'Recommended answer', points: '+25 pts' },
];

const levelGroups = [
  {
    title: 'Beginner',
    range: '0-200 points',
    icon: Star,
    badges: [
      { name: 'First Question', description: 'Asked your first question', iconName: 'CircleHelp' },
      { name: 'Curious Mind', description: 'Asked 10 questions', iconName: 'Brain' },
      { name: 'Helpful Hand', description: 'Gave your first answer', iconName: 'Handshake' },
    ],
  },
  {
    title: 'Contributor',
    range: '200-500 points',
    icon: Award,
    badges: [
      { name: 'Rising Star', description: 'Received 50 upvotes', iconName: 'Star' },
      { name: 'Knowledge Sharer', description: 'Answered 25 questions', iconName: 'BookOpen' },
      { name: 'Top Contributor', description: 'Received 100 upvotes', iconName: 'Trophy' },
    ],
  },
  {
    title: 'Expert',
    range: '500-1000 points',
    icon: Trophy,
    badges: [
      {
        name: 'Module Master',
        description: 'Top answerer in a module',
        iconName: 'GraduationCap',
      },
      { name: 'Scholar', description: '500+ reputation points', iconName: 'Medal' },
      { name: 'Legend', description: '1000+ reputation points', iconName: 'Crown' },
    ],
  },
];

export default async function StudentBadgesPage() {
  const profile = await getUserProfileData();
  const earnedNames = new Set(profile.badges.map((badge) => badge.name));
  const levelLabel =
    profile.reputationPoints >= 1000
      ? 'Expert Level'
      : profile.reputationPoints >= 500
        ? 'Contributor Level'
        : 'Beginner Level';

  const timeline = profile.badges.map((badge, index) => ({
    ...badge,
    dateLabel: `2026-0${Math.min(index + 1, 9)}-15`,
  }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 md:px-8">
      <h1 className="text-5xl font-bold text-slate-100">Badges & Reputation</h1>

      <section className="rounded-2xl bg-linear-to-r from-blue-900 to-indigo-700 p-10 text-center">
        <Award className="mx-auto h-16 w-16 text-orange-400" />
        <p className="mt-4 text-6xl font-extrabold">{profile.reputationPoints} Points</p>
        <p className="mt-2 text-2xl text-blue-100">{levelLabel}</p>
      </section>

      <section className="card-shell space-y-4 p-6">
        <h2 className="text-4xl font-semibold text-slate-100">How Points Work</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {pointsRules.map((rule) => (
            <div
              key={rule.label}
              className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/80 p-4"
            >
              <span className="text-lg text-slate-200">{rule.label}</span>
              <span className="text-lg font-semibold text-blue-300">{rule.points}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-4xl font-semibold text-slate-100">Badge Levels</h2>

        {levelGroups.map((level) => (
          <article key={level.title} className="card-shell rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-blue-600/20 p-2 text-blue-400">
                <level.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-4xl font-semibold text-slate-100">{level.title}</p>
                <p className="text-xl text-slate-400">{level.range}</p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {level.badges.map((badge) => {
                const Icon = badgeIconMap[badge.iconName as keyof typeof badgeIconMap] ?? Award;
                const unlocked = earnedNames.has(badge.name);

                return (
                  <div
                    key={`${level.title}-${badge.name}`}
                    className={`rounded-xl border p-4 ${
                      unlocked
                        ? 'border-orange-600/40 bg-orange-500/10'
                        : 'border-slate-800 bg-slate-900/70 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${unlocked ? 'text-orange-400' : 'text-slate-500'}`}
                      />
                      <p className="text-xl font-semibold text-slate-100">{badge.name}</p>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      <section className="card-shell rounded-2xl p-6">
        <h2 className="mb-4 text-4xl font-semibold text-slate-100">Achievement Timeline</h2>
        {timeline.length === 0 ? (
          <p className="text-slate-400">
            No badges unlocked yet. Start by asking your first question.
          </p>
        ) : (
          <div className="space-y-4">
            {timeline.map((badge, index) => {
              const Icon = badgeIconMap[badge.iconName as keyof typeof badgeIconMap] ?? Award;

              return (
                <div key={badge.id} className="relative flex items-start gap-4">
                  {index !== timeline.length - 1 ? (
                    <span className="absolute left-4 top-10 h-10 w-px bg-slate-800" />
                  ) : null}

                  <div className="relative z-10 rounded-full bg-blue-600/20 p-2 text-blue-300">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-2xl font-semibold text-slate-100">{badge.name}</p>
                    <p className="text-lg text-slate-400">{badge.dateLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
