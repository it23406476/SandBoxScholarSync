'use client';

import {
  Home,
  MessageSquare,
  PlusCircle,
  /* Award, */ User,
  LayoutDashboard,
  BookOpen,
  /* BarChart3, */ HelpCircle,
  /* LogOut, */ X,
  BarChart3,
} from 'lucide-react';
import { NavLink } from '../NavLink';
//import { useRouter } from "next/navigation";

type UserRole = 'student' | 'lecturer';

interface CollapsibleSidebarProps {
  role: UserRole;
  open: boolean;
  onClose: () => void;
}

const studentNav = [
  { to: '/dashboard', icon: Home, label: 'Dashboard', end: true },
  { to: '/hub', icon: MessageSquare, label: 'Q&A Forum', end: true },
  { to: '/qna', icon: HelpCircle, label: 'Q&A', end: true },
  { to: '/qna/my', icon: HelpCircle, label: 'My Questions', end: true },
  { to: '/ask', icon: PlusCircle, label: 'Ask Question', end: true },
  { to: '/forum', icon: BookOpen, label: 'Knowledge Forum', end: true },
  { to: '/profile', icon: User, label: 'Profile', end: true },
];

const lecturerNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/modules', icon: BookOpen, label: 'Manage Modules', end: true },
  { to: '/lecturer', icon: HelpCircle, label: 'Question Forum', end: true },
  { to: '/forum', icon: MessageSquare, label: 'Forum', end: true },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', end: true },
  { to: '/profile', icon: User, label: 'Profile', end: true },
];

export function CollapsibleSidebar({ role, open, onClose }: CollapsibleSidebarProps) {
  const items = role === 'student' ? studentNav : lecturerNav;
  //const router = useRouter();

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
              end={item.end}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
              activeClassName="bg-primary/10 text-primary font-medium"
              onClick={onClose}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
