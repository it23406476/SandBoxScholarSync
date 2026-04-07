import { NextRequest, NextResponse } from 'next/server';
import { getServerSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // Validate that the userId matches the authenticated user
    if (userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const existingLike = await prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { userId_postId: { userId, postId } } });
      await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return NextResponse.json({ liked: false });
    } else {
      const newLike = await prisma.like.create({ data: { userId, postId } });
      await prisma.post.update({
        where: { id: postId },
        data: { likeCount: { increment: 1 } },
      });

      // Create notification for post author (if not liking their own post)
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true, title: true },
      });

      if (post && post.authorId !== userId) {
        const liker = await prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });

        if (liker) {
          await prisma.notification.create({
            data: {
              type: 'POST_LIKED',
              message: `${liker.name} liked your post "${post.title}"`,
              recipientId: post.authorId,
              postId: postId,
              likeId: newLike.id,
            },
          });
        }
      }

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
