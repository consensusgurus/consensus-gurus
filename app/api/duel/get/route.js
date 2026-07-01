import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/get?token=...
export async function GET(request) {
  try {
    const token = (new URL(request.url).searchParams.get('token') || '').trim();
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('quiz_duels').select('*').eq('token', token).maybeSingle();
    if (error && error.code === '42P01') return NextResponse.json({ error: 'duels_not_ready' }, { status: 503 });
    if (error) return NextResponse.json({ error: 'db error' }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ duel: data });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
