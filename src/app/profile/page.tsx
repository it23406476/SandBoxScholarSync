import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (session?.user?.role === 'STUDENT') {
    redirect('/student/profile');
  }

  if (session?.user?.role === 'LECTURER') {
    redirect('/lecturer');
  }

  redirect('/dashboard');
}
