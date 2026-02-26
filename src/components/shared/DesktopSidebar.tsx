'use client';

import {
  Home,
  MessageSquare,
  PlusCircle,
  /* Award, */ User,
  LayoutDashboard,
  BookOpen,
  /*BarChart3, */ HelpCircle,
  LogOut,
} from 'lucide-react';
import { NavLink } from '../NavLink';
import { useRouter } from 'next/navigation'; // Changed from react-router-dom

// Using a simple type for now to avoid mock-data errors
type UserRole = 'student' | 'lecturer';

interface DesktopSidebarProps {
  role: UserRole;
}

const studentNav = [
  { to: '/student', icon: Home, label: 'Dashboard' },
  { to: '/qna', icon: HelpCircle, label: 'My Questions' },
  { to: '/ask', icon: PlusCircle, label: 'Ask Question' },
  { to: '/forum', icon: BookOpen, label: 'Knowledge Forum' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const lecturerNav = [
  { to: '/lecturer', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/modules', icon: BookOpen, label: 'Manage Modules' },
  { to: '/qna', icon: HelpCircle, label: 'All Questions' },
  { to: '/forum', icon: MessageSquare, label: 'Forum' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function DesktopSidebar({ role }: DesktopSidebarProps) {
  const items = role === 'student' ? studentNav : lecturerNav;
  const router = useRouter(); // Next.js router

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card min-h-screen sticky top-0">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold">
          <span className="text-primary">Scholar</span>
          <span className="text-accent">Sync</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1 capitalize">{role} Portal</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/student' || item.to === '/lecturer'}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
