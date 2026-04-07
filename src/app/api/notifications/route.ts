import { NextRequest, NextResponse } from 'next/server';
import { getServerSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const notifications = await prisma.notification.findMany({
      where: { recipientId: sessionUser.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        post: {
          select: {
            id: true,
            title: true,
            author: { select: { id: true, name: true } },
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            author: { select: { id: true, name: true } },
          },
        },
        like: {
          select: {
            id: true,
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    const total = await prisma.notification.count({
      where: { recipientId: sessionUser.id },
    });

    return NextResponse.json({
      notifications,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationIds } = await request.json();

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
    }

    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        recipientId: sessionUser.id,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
