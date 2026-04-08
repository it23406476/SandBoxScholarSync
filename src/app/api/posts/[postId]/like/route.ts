import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSessionUser } from '@/lib/auth';
import { toggleUserPostLike } from '@/lib/community/serverState';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, likes: true },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const liked = toggleUserPostLike(sessionUser.id, postId);

    const updated = await prisma.post.update({
      where: { id: postId },
      data: {
        likes: liked ? { increment: 1 } : { decrement: post.likes > 0 ? 1 : 0 },
      },
      select: { likes: true },
    });

    return NextResponse.json({ liked, likeCount: updated.likes });
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}
