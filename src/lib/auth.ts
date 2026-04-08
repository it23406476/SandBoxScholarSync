import { getServerSession, type NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

const isProduction = process.env.NODE_ENV === 'production';
const sessionTokenName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'next-auth.session-token';

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : [];

const providers: NextAuthOptions['providers'] = [
  ...googleProvider,
  Credentials({
    name: 'Email & Password',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      const email = credentials?.email?.toLowerCase().trim();
      const password = credentials?.password;

      if (!email || !password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          password: true,
        },
      });

      if (!user?.password) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
    },
  }),
];

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  useSecureCookies: isProduction,
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60,
    updateAge: 60 * 60,
  },
  jwt: {
    maxAge: 12 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  cookies: {
    sessionToken: {
      name: sessionTokenName,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      },
    },
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      // On initial login, persist user identity in JWT.
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: Role }).role;
      }

      // In serverless environments, avoid DB calls on every request.
      // Only hydrate missing fields.
      if ((!token.id || !token.role) && (token.sub || token.email)) {
        try {
          const dbUser = token.sub
            ? await prisma.user.findUnique({
                where: { id: token.sub },
                select: { id: true, role: true },
              })
            : await prisma.user.findUnique({
                where: { email: token.email as string },
                select: { id: true, role: true },
              });

          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error('JWT hydration lookup failed:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'STUDENT' | 'LECTURER' | 'ADMIN';
      }
      return session;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getServerSessionUser() {
  const session = await getAuthSession();
  return session?.user ?? null;
}
