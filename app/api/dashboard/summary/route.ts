import { NextResponse } from 'next/server';
import { getDashboardSummary } from '@/lib/dashboard';

export async function GET() {
  try {
    const summary = await getDashboardSummary();
    return NextResponse.json({ success: true, summary });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to load dashboard summary' },
      { status: 500 }
    );
  }
}
