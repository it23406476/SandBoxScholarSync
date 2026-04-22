import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getServerSessionUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'recent';
    const limit = 10;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.PostWhereInput = {};
    if (category && category !== 'all') whereClause.category = category;
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    let orderBy: Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[] = {
      createdAt: 'desc',
    };
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

    const normalizedPosts = posts.map((post) => {
      let attachments: Array<{ name: string; data: string }> = [];

      try {
        attachments = JSON.parse(post.attachments || '[]') as Array<{ name: string; data: string }>;
      } catch {
        attachments = [];
      }

      return {
        ...post,
        attachments,
      };
    });

    return NextResponse.json({
      posts: normalizedPosts,
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

    const { title, content, category, imageUrl, attachments } = await request.json();

    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const attachmentsValue = JSON.stringify(Array.isArray(attachments) ? attachments : []);

    const post = await prisma.post.create({
      data: {
        title,
        content,
        category,
        imageUrl,
        authorId: sessionUser.id,
        attachments: attachmentsValue,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(
      {
        ...post,
        attachments: JSON.parse(post.attachments || '[]'),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
