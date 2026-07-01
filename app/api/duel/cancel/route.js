import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// POST /api/duel/cancel  { token, anonId }
// The CHALLENGER dismisses their own duel before it completes (e.g. an open
// invite nobody accepted). Marks it 'cancelled' so it drops out of their
// Your Move list and never comes back. Only the challenger may cancel; the
// opponent turns a duel down via /api/duel/decline instead.
export async function POST(request) {
  try {
    const b = (await request.json()) || {};
    const token = (typeof b.token === 'string' ? b.token.trim() : '');
    const anonId = typeof b.anonId === 'string' && b.anonId.trim() ? b.anonId.trim().slice(0, 64) : null;
    if (!token || !anonId) return NextResponse.json({ error: 'token and anonId required' }, { status: 400 });
    const { data: duel, error: de } = await supabaseAdmin.from('quiz_duels').select('*').eq('token', token).maybeSingle();
    if (de && de.code === '42P01') return NextResponse.json({ error: 'duels_not_ready' }, { status: 503 });
    if (de) return NextResponse.json({ error: 'db error' }, { status: 500 });
    if (!duel) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (duel.status === 'complete') return NextResponse.json({ error: 'already_complete' }, { status: 400 });
    if (duel.status === 'cancelled' || duel.status === 'declined') return NextResponse.json({ duel });
    if (duel.challenger_anon !== anonId) return NextResponse.json({ error: 'only_challenger_can_cancel' }, { status: 403 });
    const { data: updated, error: ue } = await supabaseAdmin
      .from('quiz_duels')
      .update({ status: 'cancelled', completed_at: new Date().toISOString() })
      .eq('token', token)
      .select('*')
      .single();
    if (ue) return NextResponse.json({ error: 'db error' }, { status: 500 });
    return NextResponse.json({ duel: updated });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
