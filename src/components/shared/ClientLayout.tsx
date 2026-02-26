'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation'; // ADD THIS
import { BottomNav } from './BottomNav';
import { CollapsibleSidebar } from './CollapsibleSidebar';
import { DesktopSidebar } from './DesktopSidebar';
import { Menu } from 'lucide-react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname(); // GET CURRENT URL
  const currentRole = 'student';

  // Check if we are on a public page (Landing, Login, Register)
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/register';

  // If it's a public page, ONLY render the content (no sidebars)
  if (isPublicPage) {
    return <div className="min-h-screen w-full bg-background">{children}</div>;
  }

  // Otherwise, render the full Dashboard Layout
  return (
    <div className="flex min-h-screen w-full bg-background">
      <DesktopSidebar role={currentRole} />
      <CollapsibleSidebar
        role={currentRole}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

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

        <div className="flex-1 overflow-auto">{children}</div>
      </main>

      <BottomNav role={currentRole} />
    </div>
  );
}
