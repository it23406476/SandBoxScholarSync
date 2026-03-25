'use client';

import {
  Home,
  MessageSquare,
  PlusCircle,
  /* Award, */ User,
  LayoutDashboard,
  BookOpen,
  /* BarChart3, */ HelpCircle,
  LogOut,
  X,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { NavLink } from '../NavLink';
import { signOut } from 'next-auth/react';

type UserRole = 'student' | 'lecturer';

interface CollapsibleSidebarProps {
  role: UserRole;
  open: boolean;
  onClose: () => void;
}

type SidebarNavItem = {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
};

const studentNav: SidebarNavItem[] = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/hub', icon: MessageSquare, label: 'Q&A Forum' },
  { to: '/qna', icon: HelpCircle, label: 'Q&A', end: true },
  { to: '/qna/my', icon: HelpCircle, label: 'My Questions', end: true },
  { to: '/ask', icon: PlusCircle, label: 'Ask Question' },
  { to: '/forum', icon: BookOpen, label: 'Knowledge Forum' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const lecturerNav: SidebarNavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/qna', icon: HelpCircle, label: 'Q&A', end: true },
  { to: '/qna/my', icon: HelpCircle, label: 'My Questions', end: true },
  { to: '/modules', icon: BookOpen, label: 'Manage Modules' },
  { to: '/forum', icon: MessageSquare, label: 'Forum' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export function CollapsibleSidebar({ role, open, onClose }: CollapsibleSidebarProps) {
  const items = role === 'student' ? studentNav : lecturerNav;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r shadow-lg transform transition-transform duration-300 ease-in-out md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              <span className="text-primary">Scholar</span>
              <span className="text-accent">Sync</span>
            </h1>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end || false}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              activeClassName="bg-primary/10 text-primary font-medium"
              onClick={onClose}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={() => {
              onClose();
              signOut({ callbackUrl: '/login' });
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
