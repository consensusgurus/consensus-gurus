import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { resolveAnonSet } from '@/lib/quiz-identity';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// POST /api/duel/decline  { token, anonId, name?, email? }
// The challenged ACCOUNT turns the duel down. Marks it 'declined'.
export async function POST(request) {
  try {
    const b = (await request.json()) || {};
    const token = (typeof b.token === 'string' ? b.token.trim() : '');
    const anonId = typeof b.anonId === 'string' && b.anonId.trim() ? b.anonId.trim().slice(0, 64) : null;
    const email = typeof b.email === 'string' && b.email.trim() ? b.email.trim() : null;
    const name = (typeof b.name === 'string' ? b.name.trim() : '').slice(0, 40) || 'Player';
    if (!token || !anonId) return NextResponse.json({ error: 'token and anonId required' }, { status: 400 });
    const { data: duel, error: de } = await supabaseAdmin.from('quiz_duels').select('*').eq('token', token).maybeSingle();
    if (de && de.code === '42P01') return NextResponse.json({ error: 'duels_not_ready' }, { status: 503 });
    if (de) return NextResponse.json({ error: 'db error' }, { status: 500 });
    if (!duel) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (duel.status === 'complete' || duel.status === 'declined') return NextResponse.json({ duel });
    const anons = await resolveAnonSet(supabaseAdmin, { anonId, email });
    const mine = new Set(anons);
    if (duel.challenger_anon && mine.has(duel.challenger_anon)) return NextResponse.json({ error: 'cannot_decline_own' }, { status: 400 });
    if (duel.opponent_anon && !mine.has(duel.opponent_anon)) return NextResponse.json({ error: 'duel_full' }, { status: 409 });
    const patch = { status: 'declined', completed_at: new Date().toISOString(), opponent_name: name };
    if (!duel.opponent_anon) patch.opponent_anon = anonId;
    const { data: updated, error: ue } = await supabaseAdmin.from('quiz_duels').update(patch).eq('token', token).select('*').single();
    if (ue) return NextResponse.json({ error: 'db error' }, { status: 500 });
    return NextResponse.json({ duel: updated });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
