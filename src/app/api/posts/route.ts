import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recent';
    const limit = 10;
    const skip = (page - 1) * limit;

    interface WhereClause {
      category?: string;
      OR?: Array<{ title?: { contains: string; mode: string } } | { content?: { contains: string; mode: string } }>;
    }
    const whereClause: WhereClause = {};
    if (category && category !== 'all') whereClause.category = category;
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    interface OrderBy {
      createdAt?: string;
      likeCount?: string;
      commentCount?: string;
    }
    let orderBy: OrderBy = { createdAt: 'desc' };
    if (sort === 'trending') orderBy = [{ likeCount: 'desc' }, { commentCount: 'desc' }];
    else if (sort === 'most-commented') orderBy = { commentCount: 'desc' };
    else if (sort === 'most-liked') orderBy = { likeCount: 'desc' };

    const posts = await prisma.post.findMany({
      where: whereClause,
      orderBy,
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });

    const total = await prisma.post.count({ where: whereClause });

    return NextResponse.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, category, imageUrl, authorId, attachments } = await request.json();

    if (!title || !content || !category || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: { 
        title, 
        content, 
        category, 
        imageUrl, 
        authorId,
        attachments: attachments || [],
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
