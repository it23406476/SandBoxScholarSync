'use server';

import bcrypt from 'bcryptjs';
import { Prisma, Role } from '@prisma/client';
import prisma from '@/lib/prisma';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

type ForgotPasswordInput = {
  email: string;
};

type ResetPasswordInput = {
  email: string;
  otp: string;
  newPassword: string;
};

export async function registerUser(input: RegisterInput) {
  try {
    const email = input.email.toLowerCase().trim();
    const name = input.name.trim();
    const databaseUrl = process.env.DATABASE_URL ?? '';
    const isFileDatabase = databaseUrl.startsWith('file:');

    if (!name || !email || !input.password) {
      return { success: false, message: 'All fields are required.' };
    }

    // Vercel serverless functions cannot reliably persist SQLite file writes.
    if (process.env.VERCEL && isFileDatabase) {
      return {
        success: false,
        message:
          'Signup is unavailable: production database is not configured for writes. Set DATABASE_URL to a managed PostgreSQL database on Vercel.',
      };
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        role: input.role,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('registerUser failed:', error);

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return {
        success: false,
        message:
          'Database connection failed. Check your production DATABASE_URL and run migrations.',
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, message: 'An account with this email already exists.' };
    }

    return { success: false, message: 'Unable to create account right now.' };
  }
}

export async function requestPasswordResetOtp(input: ForgotPasswordInput) {
  try {
    const email = input.email.toLowerCase().trim();
    if (!email) {
      return { success: false, message: 'Email is required.' };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return {
        success: true,
        message: 'If this email exists, a reset OTP has been sent.',
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOtp: otp,
        passwordResetOtpExpires: expires,
      },
    });

    // Viva mock mail sender.
    console.log(`[MOCK OTP EMAIL] ${email} -> OTP: ${otp} (expires: ${expires.toISOString()})`);

    return {
      success: true,
      message: 'If this email exists, a reset OTP has been sent.',
      ...(process.env.NODE_ENV === 'development' && { otp }),
    };
  } catch (error) {
    console.error('requestPasswordResetOtp failed:', error);
    return { success: false, message: 'Failed to send reset OTP.' };
  }
}

export async function resetPasswordWithOtp(input: ResetPasswordInput) {
  try {
    const email = input.email.toLowerCase().trim();
    const otp = input.otp.trim();

    if (!email || !otp || !input.newPassword) {
      return { success: false, message: 'All fields are required.' };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordResetOtp || !user.passwordResetOtpExpires) {
      return { success: false, message: 'Invalid OTP request.' };
    }

    const isExpired = user.passwordResetOtpExpires.getTime() < Date.now();
    if (isExpired || user.passwordResetOtp !== otp) {
      return { success: false, message: 'OTP is invalid or expired.' };
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetOtp: null,
        passwordResetOtpExpires: null,
      },
    });

    return { success: true, message: 'Password reset successful.' };
  } catch (error) {
    console.error('resetPasswordWithOtp failed:', error);
    return { success: false, message: 'Failed to reset password.' };
  }
}
