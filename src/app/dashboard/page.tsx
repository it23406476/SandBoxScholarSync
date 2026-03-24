import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';

export default async function DashboardEntryPage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role === 'LECTURER') {
    redirect('/dashboard/lecturer');
  }

  redirect('/dashboard/student');
}
