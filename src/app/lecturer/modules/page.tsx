import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ModuleManagement } from '@/components/lecturer/ModuleManagement';

export default async function LecturerModulesPage() {
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
        <h1 className="text-2xl font-bold">Manage Modules</h1>
        <p className="text-sm text-muted-foreground">
          Create, update, and delete lecturer-assigned modules safely.
        </p>
      </div>
      <ModuleManagement />
    </div>
  );
}
