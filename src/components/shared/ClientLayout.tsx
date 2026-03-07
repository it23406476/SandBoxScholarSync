'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation'; // ADD THIS
import { BottomNav } from './BottomNav';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { DesktopSidebar } from './DesktopSidebar';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { Button } from '../ui/button';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // get the current role from the store
  const { role, setRole } = useAuthStore();

  const isDashboardPage = pathname.startsWith('/student') || pathname.startsWith('/lecturer');

  // Keep the dashboard shell only for dashboard routes.
  if (!isDashboardPage) {
    return <div className="min-h-screen w-full bg-background">{children}</div>;
  }

  // Otherwise, render the full Dashboard Layout
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DesktopSidebar role={role} />
      <CollapsibleSidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 pb-16 md:pb-0 flex flex-col min-w-0">
        <div className="md:hidden sticky top-0 z-40 border-b bg-card/95 backdrop-blur-md px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-bold">
              <span className="text-primary">Scholar</span>
              <span className="text-accent">Sync</span>
            </h1>
          </div>
        </div>

        {/* DEV MODE TOGGLE: Switch roles instantly */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-muted px-2 py-1 rounded-md border text-muted-foreground mr-2">
            <span>Dev Mode:</span>
            <Button
              variant={role === 'student' ? 'default' : 'outline'}
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={() => setRole('student')}
            >
              Student
            </Button>
            <Button
              variant={role === 'lecturer' ? 'default' : 'outline'}
              size="sm"
              className="h-6 px-2 text-[10px]"
              onClick={() => setRole('lecturer')}
            >
              Lecturer
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">{children}</div>
      </main>

      <BottomNav role={role} />
    </div>
  );
}
