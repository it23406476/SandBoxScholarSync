import { NextRequest, NextResponse } from 'next/server';
import { getServerSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, postId, authorId } = await request.json();

    if (!content || !postId || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate that the authorId matches the authenticated user
    if (authorId !== sessionUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const comment = await prisma.comment.create({
      data: { content, postId, authorId },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    await prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });

    // Create notification for post author (if not commenting on their own post)
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true, title: true },
    });

    if (post && post.authorId !== authorId) {
      const commenter = await prisma.user.findUnique({
        where: { id: authorId },
        select: { name: true },
      });

      if (commenter) {
        await prisma.notification.create({
          data: {
            type: 'POST_COMMENTED',
            message: `${commenter.name} commented on your post "${post.title}"`,
            recipientId: post.authorId,
            postId: postId,
            commentId: comment.id,
          },
        });
      }
    }

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
