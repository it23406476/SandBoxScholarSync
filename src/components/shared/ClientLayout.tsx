'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation'; // ADD THIS
import { signOut, useSession } from 'next-auth/react';
import { BottomNav } from './BottomNav';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { DesktopSidebar } from './DesktopSidebar';
import { Menu } from 'lucide-react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role === 'LECTURER' ? 'lecturer' : 'student';

  const publicRoutes = ['/', '/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Hide app navigation only on public auth/landing pages.
  if (isPublicRoute) {
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
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground truncate max-w-[130px]">
              {session?.user?.name}
            </p>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-xs font-medium text-primary hover:underline"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">{children}</div>
      </main>

      <BottomNav role={role} />
    </div>
  );
}
