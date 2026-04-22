import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSessionUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const sessionUser = await getServerSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await params;
    const body = await request.json();

    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: sessionUser.id,
      },
      select: { id: true },
    });

    if (!existingNotification) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: body,
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
