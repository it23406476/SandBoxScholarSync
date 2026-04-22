import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSessionUser } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (existingComment.authorId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { content, isEdited: true },
      include: { author: { select: { id: true, name: true } } },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: { select: { id: true } } },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    if (comment.authorId !== sessionUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const replies = await prisma.comment.findMany({
      where: { parentCommentId: commentId },
      select: { id: true },
    });
    const replyIds = replies.map((reply) => reply.id);

    // Delete all replies to this comment
    await prisma.comment.deleteMany({
      where: { parentCommentId: commentId },
    });

    // Delete the comment
    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Update post comment count
    await prisma.post.update({
      where: { id: comment.post.id },
      data: { commentCount: { decrement: 1 + replyIds.length } },
    });

    // Delete related notifications
    await prisma.notification.deleteMany({
      where: {
        OR: [
          { commentId: commentId },
          { commentId: { in: replyIds } },
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
