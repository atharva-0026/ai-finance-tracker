import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json().catch(() => ({ action: 'start' }));

    const response = NextResponse.json({ success: true, mode: action });

    if (action === 'start') {
      response.cookies.set('ai_finance_demo', 'true', {
        path: '/',
        httpOnly: true,
        maxAge: 86400 * 7, // 7 days
        sameSite: 'lax',
      });
    } else {
      // Clear demo
      response.cookies.set('ai_finance_demo', '', {
        path: '/',
        maxAge: 0,
      });
      response.cookies.set('ai_finance_demo_data', '', {
        path: '/',
        maxAge: 0,
      });
    }

    return response;
  } catch (err) {
    console.error('Demo auth error:', err);
    return NextResponse.json({ error: 'Failed to toggle demo session' }, { status: 500 });
  }
}
