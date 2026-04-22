import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { content, postId, authorId } = await request.json();

    if (!content || !postId || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { content, postId, authorId },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    await prisma.post.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
