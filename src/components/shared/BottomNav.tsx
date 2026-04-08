'use client';

import { HelpCircle, MessageSquare } from 'lucide-react';
import { NavLink } from '../NavLink';

type UserRole = 'student' | 'lecturer';

interface BottomNavProps {
  role: UserRole;
}

const mainNav = [
  { to: '/qna', icon: HelpCircle, label: 'Q&A' },
  { to: '/community', icon: MessageSquare, label: 'Community' },
];

export function BottomNav({} /* role */ : BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around py-2">
        {mainNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-0.5 px-6 py-1.5 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
