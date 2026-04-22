import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const unreadCount = await prisma.notification.count({
      where: {
        userId: sessionUser.id,
        isRead: false,
      },
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch unread count' }, { status: 500 });
  }
}
