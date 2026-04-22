import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;
    const userId = sessionUser.id;

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
      const post = await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return NextResponse.json({ liked: false, likeCount: post.likeCount });
    } else {
      await prisma.like.create({ data: { userId, postId } });
      const post = await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true, authorId: true, title: true },
      });

      if (post.authorId !== userId) {
        await prisma.notification.create({
          data: {
            type: 'like',
            title: 'New like on your article',
            message: `${sessionUser.name || 'Someone'} liked your article${post.title ? ` "${post.title}"` : ''}`,
            userId: post.authorId,
            postId,
            triggeredByUserId: userId,
          },
        });
      }

      return NextResponse.json({ liked: true, likeCount: post.likeCount });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
