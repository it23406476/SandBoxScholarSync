import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/qna',
  '/ask',
  '/community',
  '/lecturer',
  '/modules',
  '/analytics',
  '/student',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  if (token && pathname === '/dashboard') {
    if (token.role === 'LECTURER') {
      return NextResponse.redirect(new URL('/dashboard/lecturer', req.url));
    }

    if (token.role === 'STUDENT') {
      return NextResponse.redirect(new URL('/dashboard/student', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
