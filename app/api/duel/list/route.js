import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/list?anonId=...
// A player's duels split into: yourMove (challenger posted, you haven't),
// awaiting (you posted, waiting on them / open link), completed.
export async function GET(request) {
  try {
    const anonId = (new URL(request.url).searchParams.get('anonId') || '').trim().slice(0, 64);
    if (!anonId) return NextResponse.json({ yourMove: [], awaiting: [], completed: [] });
    const { data, error } = await supabaseAdmin
      .from('quiz_duels')
      .select('*')
      .or(`challenger_anon.eq.${anonId},opponent_anon.eq.${anonId}`)
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) return NextResponse.json({ yourMove: [], awaiting: [], completed: [] });
    const yourMove = [], awaiting = [], completed = [];
    for (const d of (data || [])) {
      const isChal = d.challenger_anon === anonId;
      const myScore = isChal ? d.challenger_score : d.opponent_score;
      if (d.status === 'complete') completed.push(d);
      else if (!isChal && d.challenger_score != null && d.opponent_score == null) yourMove.push(d);
      else if (myScore == null) yourMove.push(d);
      else awaiting.push(d);
    }
    return NextResponse.json({ yourMove, awaiting, completed });
  } catch (e) {
    return NextResponse.json({ yourMove: [], awaiting: [], completed: [] });
  }
}
