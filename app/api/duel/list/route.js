import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { resolveAnonSet, duelOrFilter } from '@/lib/quiz-identity';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/list?anonId=...&email=...
// A player's duels split into: yourMove (their turn to play), awaiting (they
// played, waiting on the other), completed. Resolved across EVERY browser anon
// the account owns, so a duel started on another device still shows here.
export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const anonId = (sp.get('anonId') || '').trim().slice(0, 64);
    const email = (sp.get('email') || '').trim() || null;
    if (!anonId) return NextResponse.json({ yourMove: [], awaiting: [], completed: [] });
    const anons = await resolveAnonSet(supabaseAdmin, { anonId, email });
    const mine = new Set(anons);
    const { data, error } = await supabaseAdmin
      .from('quiz_duels')
      .select('*')
      .or(duelOrFilter(anons))
      .order('created_at', { ascending: false })
      .limit(80);
    if (error) return NextResponse.json({ yourMove: [], awaiting: [], completed: [] });
    const yourMove = [], awaiting = [], completed = [];
    for (const d of (data || [])) {
      if (d.status === 'cancelled') continue;
      const isChal = mine.has(d.challenger_anon);
      const myScore = isChal ? d.challenger_score : d.opponent_score;
      if (d.status === 'complete' || d.status === 'declined') completed.push(d);
      else if (!isChal && d.challenger_score != null && d.opponent_score == null) yourMove.push(d);
      else if (myScore == null) yourMove.push(d);
      else awaiting.push(d);
    }
    return NextResponse.json({ yourMove, awaiting, completed });
  } catch (e) {
    return NextResponse.json({ yourMove: [], awaiting: [], completed: [] });
  }
}
