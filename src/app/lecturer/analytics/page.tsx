import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LecturerAnalyticsBoard } from '@/components/lecturer/LecturerAnalyticsBoard';

export default async function LecturerAnalyticsPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'LECTURER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Lecturer Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Real data from your assigned modules. Auto-refresh every 3 minutes.
        </p>
      </div>
      <LecturerAnalyticsBoard />
    </div>
  );
}
