import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: { select: { id: true, name: true, email: true } },
        comments: {
          where: { parentCommentId: null },
          include: {
            author: { select: { id: true, name: true, email: true } },
            replies: {
              include: { author: { select: { id: true, name: true, email: true } } },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        likes: { select: { userId: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let attachments: Array<{ name: string; data: string }> = [];
    try {
      attachments = JSON.parse(post.attachments || '[]') as Array<{ name: string; data: string }>;
    } catch {
      attachments = [];
    }

    return NextResponse.json({ ...post, attachments });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
