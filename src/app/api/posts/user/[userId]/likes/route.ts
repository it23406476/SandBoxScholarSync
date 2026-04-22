import { NextRequest, NextResponse } from 'next/server';
import { getServerSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    if (userId !== 'me' && userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const targetUserId = userId === 'me' ? sessionUser.id : userId;
    const likedPosts = await prisma.like.findMany({
      where: { userId: targetUserId },
      select: { postId: true },
    });

    const likedPostIds = likedPosts.map((item) => item.postId);
    return NextResponse.json({ likedPostIds });
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return NextResponse.json({ error: 'Failed to fetch user likes' }, { status: 500 });
  }
}
