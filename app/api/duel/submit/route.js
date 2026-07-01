import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function decideWinner(cs, ct, os, ot) {
  if (cs == null || os == null) return null;
  if (cs !== os) return cs > os ? 'challenger' : 'opponent';
  const a = ct == null ? 1e9 : ct, bb = ot == null ? 1e9 : ot;
  if (a !== bb) return a < bb ? 'challenger' : 'opponent';
  return 'tie';
}

// POST /api/duel/submit  { token, anonId, name }
// Records the caller's side from their OWN best quiz_results play on the duel's
// quiz since the duel was created (so no quiz board needs to change).
export async function POST(request) {
  try {
    const b = (await request.json()) || {};
    const token = (typeof b.token === 'string' ? b.token.trim() : '');
    const anonId = typeof b.anonId === 'string' && b.anonId.trim() ? b.anonId.trim().slice(0, 64) : null;
    const name = (typeof b.name === 'string' ? b.name.trim() : '').slice(0, 40) || 'Player';
    if (!token || !anonId) return NextResponse.json({ error: 'token and anonId required' }, { status: 400 });

    const { data: duel, error: de } = await supabaseAdmin.from('quiz_duels').select('*').eq('token', token).maybeSingle();
    if (de && de.code === '42P01') return NextResponse.json({ error: 'duels_not_ready' }, { status: 503 });
    if (de) return NextResponse.json({ error: 'db error' }, { status: 500 });
    if (!duel) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    if (duel.status === 'complete') return NextResponse.json({ duel });

    const isChallenger = !!duel.challenger_anon && duel.challenger_anon === anonId;
    if (!isChallenger && duel.opponent_anon && duel.opponent_anon !== anonId) {
      return NextResponse.json({ error: 'duel_full' }, { status: 409 });
    }

    const { data: plays, error: pe } = await supabaseAdmin.from('quiz_results')
      .select('score, total, time_elapsed, created_at')
      .eq('quiz_id', duel.quiz_id)
      .eq('anon_id', anonId)
      .gte('created_at', duel.created_at)
      .order('score', { ascending: false })
      .order('time_elapsed', { ascending: true })
      .limit(1);
    if (pe) return NextResponse.json({ error: 'db error' }, { status: 500 });
    if (!plays || !plays.length) return NextResponse.json({ error: 'no_play' }, { status: 409 });
    const play = plays[0];

    const patch = {};
    if (isChallenger) {
      patch.challenger_score = play.score; patch.challenger_total = play.total; patch.challenger_time = play.time_elapsed == null ? null : play.time_elapsed;
      patch.challenger_name = name;
    } else {
      patch.opponent_anon = anonId; patch.opponent_name = name;
      patch.opponent_score = play.score; patch.opponent_total = play.total; patch.opponent_time = play.time_elapsed == null ? null : play.time_elapsed;
    }
    const cs = isChallenger ? play.score : duel.challenger_score;
    const ct = isChallenger ? patch.challenger_time : duel.challenger_time;
    const os = isChallenger ? duel.opponent_score : play.score;
    const ot = isChallenger ? duel.opponent_time : patch.opponent_time;
    if (cs != null && os != null) {
      patch.status = 'complete';
      patch.winner = decideWinner(cs, ct, os, ot);
      patch.completed_at = new Date().toISOString();
    } else {
      patch.status = 'awaiting_opponent';
    }
    const { data: updated, error: ue } = await supabaseAdmin.from('quiz_duels').update(patch).eq('token', token).select('*').single();
    if (ue) return NextResponse.json({ error: 'db error' }, { status: 500 });
    return NextResponse.json({ duel: updated });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
