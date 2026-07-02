import { NextResponse } from 'next/server';
import { COOKIE_NAME, adminCookieOptions, timingSafeEqual } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const expected = process.env.ADMIN_PASSWORD;

    if (!expected) {
      return NextResponse.json(
        { error: 'admin not configured' },
        { status: 500 }
      );
    }

    if (typeof password !== 'string' || !timingSafeEqual(password, expected)) {
      // Brief delay to slow brute force
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json({ error: 'wrong password' }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    const opts = adminCookieOptions();
    response.cookies.set(COOKIE_NAME, password, opts);
    return response;
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
