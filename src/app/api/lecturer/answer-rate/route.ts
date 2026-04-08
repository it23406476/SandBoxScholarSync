import { NextResponse } from 'next/server';
import { getLecturerAnswerRateData } from '@/actions/lecturer.actions';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const result = await getLecturerAnswerRateData();

  if (!result.success) {
    return NextResponse.json({ success: false, message: result.message }, { status: 401 });
  }

  return NextResponse.json({ success: true, data: result.data });
}
