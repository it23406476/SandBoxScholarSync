import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RegisterBody;
    const email = body.email?.toLowerCase().trim() || '';
    const name = body.name?.trim() || '';
    const password = body.password || '';
    const role = body.role;
    const databaseUrl = process.env.DATABASE_URL ?? '';
    const isFileDatabase = databaseUrl.startsWith('file:');

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (process.env.VERCEL && isFileDatabase) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Signup is unavailable: production database is not configured for writes. Set DATABASE_URL to a managed PostgreSQL database on Vercel.',
        },
        { status: 503 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        role,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('register API failed:', error);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Database connection failed. Check your production DATABASE_URL and run migrations.',
        },
        { status: 503 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Unable to create account right now.' },
      { status: 500 }
    );
  }
}
