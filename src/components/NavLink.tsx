'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../lib/utils';

interface NavlinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  end?: boolean;
  onClick?: () => void;
}

export function NavLink({
  to,
  children,
  className,
  activeClassName,
  end = false,
  onClick,
}: NavlinkProps) {
  const pathname = usePathname();
  const isActive = end ? pathname === to : pathname.startsWith(to);

  return (
    <Link href={to} onClick={onClick} className={cn(className, isActive && activeClassName)}>
      {children}
    </Link>
  );
}
