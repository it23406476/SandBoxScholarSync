import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getServerSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get('page') || '1');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recent';

    const limit = 10;
    const skip = Math.max(page - 1, 0) * limit;

    const where: Prisma.PostWhereInput = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search?.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { content: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[] = {
      createdAt: 'desc',
    };

    if (sort === 'most-liked') {
      orderBy = { likes: 'desc' };
    } else if (sort === 'most-commented') {
      orderBy = { comments: { _count: 'desc' } };
    } else if (sort === 'trending') {
      orderBy = [{ comments: { _count: 'desc' } }, { likes: 'desc' }, { createdAt: 'desc' }];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, email: true } },
          _count: { select: { comments: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    return NextResponse.json({
      posts: posts.map((post) => ({
        ...post,
        imageUrl: post.fileUrl ?? null,
        likeCount: post.likes,
        commentCount: post._count.comments,
      })),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, category, imageUrl } = (await request.json()) as {
      title?: string;
      content?: string;
      category?: string;
      imageUrl?: string;
    };

    if (!title?.trim() || !content?.trim() || !category?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category: category.trim(),
        fileUrl: imageUrl?.trim() || null,
        authorId: sessionUser.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json(
      {
        ...post,
        imageUrl: post.fileUrl ?? null,
        likeCount: post.likes,
        commentCount: post._count.comments,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
