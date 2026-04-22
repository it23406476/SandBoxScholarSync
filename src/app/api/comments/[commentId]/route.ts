import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const { commentId } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
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
    const { commentId } = await params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: { select: { id: true } } },
    });

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

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
      data: { commentCount: { decrement: 1 } },
    });

    // Delete related notifications
    await prisma.notification.deleteMany({
      where: { commentId: commentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
