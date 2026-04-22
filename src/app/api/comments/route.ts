import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSessionUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, postId, parentCommentId } = await request.json();
    const authorId = sessionUser.id;

    if (!content || !postId || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
        select: { id: true, postId: true },
      });

      if (!parentComment || parentComment.postId !== postId) {
        return NextResponse.json({ error: 'Invalid parent comment' }, { status: 400 });
      }
    }

    const comment = await prisma.comment.create({
      data: { content, postId, authorId, parentCommentId },
      include: { 
        author: { select: { id: true, name: true, email: true } },
        post: { select: { id: true, authorId: true } }
      },
    });

    await prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });

    // Create notification for post author if it's a top-level comment
    if (!parentCommentId && comment.post.authorId !== authorId) {
      await prisma.notification.create({
        data: {
          type: 'comment',
          title: 'New comment on your article',
          message: `${comment.author.name} commented on your article`,
          userId: comment.post.authorId,
          postId: postId,
          commentId: comment.id,
          triggeredByUserId: authorId,
        },
      });
    }

    // Create notification for parent comment author if it's a reply
    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({ 
        where: { id: parentCommentId },
        include: { author: { select: { id: true, name: true } } }
      });
      
      if (parentComment && parentComment.authorId !== authorId) {
        await prisma.notification.create({
          data: {
            type: 'reply',
            title: 'New reply to your comment',
            message: `${comment.author.name} replied to your comment`,
            userId: parentComment.authorId,
            postId: postId,
            commentId: comment.id,
            triggeredByUserId: authorId,
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
