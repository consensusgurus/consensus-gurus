import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { resolveAnonSet } from '@/lib/quiz-identity';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/get?token=...&anonId=...&email=...
// Returns the duel plus `mine` (challenger | opponent | new) resolved against
// the ACCOUNT's full anon set, so the play UI knows the viewer's side even when
// they open the duel from a different browser than the one that created it.
export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const token = (sp.get('token') || '').trim();
    const anonId = (sp.get('anonId') || '').trim().slice(0, 64) || null;
    const email = (sp.get('email') || '').trim() || null;
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('quiz_duels').select('*').eq('token', token).maybeSingle();
    if (error && error.code === '42P01') return NextResponse.json({ error: 'duels_not_ready' }, { status: 503 });
    if (error) return NextResponse.json({ error: 'db error' }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    let mine = 'new';
    if (anonId) {
      const anons = await resolveAnonSet(supabaseAdmin, { anonId, email });
      const s = new Set(anons);
      mine = s.has(data.challenger_anon) ? 'challenger' : (data.opponent_anon && s.has(data.opponent_anon) ? 'opponent' : 'new');
    }
    return NextResponse.json({ duel: data, mine });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
