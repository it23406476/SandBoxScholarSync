import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSessionUser } from '@/lib/auth';
import { isNotificationRead, markNotificationsRead } from '@/lib/community/serverState';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const page = Number(request.nextUrl.searchParams.get('page') || '1');
    const limit = Number(request.nextUrl.searchParams.get('limit') || '20');
    const skip = Math.max(page - 1, 0) * limit;

    // Get notifications from Notification model (new system)
    const [dbNotifications, dbTotal] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: sessionUser.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({
        where: { userId: sessionUser.id },
      }),
    ]);

    // Also get legacy comment notifications
    const [comments, commentTotal] = await Promise.all([
      prisma.comment.findMany({
        where: {
          post: {
            authorId: sessionUser.id,
          },
          authorId: {
            not: sessionUser.id,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
        include: {
          author: { select: { id: true, name: true } },
          post: {
            select: {
              id: true,
              title: true,
              author: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.comment.count({
        where: {
          post: {
            authorId: sessionUser.id,
          },
          authorId: {
            not: sessionUser.id,
          },
        },
      }),
    ]);

    const legacyNotifications = comments.map((comment) => {
      const id = `comment-${comment.id}`;
      return {
        id,
        type: 'POST_COMMENTED' as const,
        message: `${comment.author.name} commented on your post "${comment.post.title}"`,
        isRead: isNotificationRead(sessionUser.id, id),
        createdAt: comment.createdAt,
        post: comment.post,
        comment: {
          id: comment.id,
          content: comment.content,
          author: comment.author,
        },
      };
    });

    // Combine both notification types
    const allNotifications = [...dbNotifications, ...legacyNotifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      notifications: allNotifications.slice(0, limit),
      total: dbTotal + commentTotal,
      page,
      pages: Math.ceil((dbTotal + commentTotal) / limit),
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

    const { notificationIds } = (await request.json()) as { notificationIds?: string[] };
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
    }

    const dbNotificationIds = notificationIds.filter((id) => !id.startsWith('comment-'));
    const legacyNotificationIds = notificationIds.filter((id) => id.startsWith('comment-'));

    if (dbNotificationIds.length > 0) {
      await prisma.notification.updateMany({
        where: {
          userId: sessionUser.id,
          id: { in: dbNotificationIds },
        },
        data: { isRead: true },
      });
    }

    if (legacyNotificationIds.length > 0) {
      markNotificationsRead(sessionUser.id, legacyNotificationIds);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
