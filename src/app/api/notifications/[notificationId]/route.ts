import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ notificationId: string }> }) {
  try {
    const { notificationId } = await params;
    const body = await request.json();

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
