import { NextRequest, NextResponse } from 'next/server';
import { getServerSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;

    // Validate that the userId matches the authenticated user
    if (userId !== sessionUser.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const likes = await prisma.like.findMany({
      where: { userId },
      select: { postId: true },
    });

    const likedPostIds = likes.map((like) => like.postId);

    return NextResponse.json({ likedPostIds });
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
