import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
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

    const [comments, total] = await Promise.all([
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
        skip,
        take: limit,
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

    const notifications = comments.map((comment) => {
      const id = `comment-${comment.id}`;
      return {
        id,
        type: 'POST_COMMENTED' as const,
        message: `${comment.author.name} commented on your post \"${comment.post.title}\"`,
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

    const { notificationIds } = (await request.json()) as { notificationIds?: string[] };
    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json({ error: 'Invalid notification IDs' }, { status: 400 });
    }

    markNotificationsRead(sessionUser.id, notificationIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
  }
}
