import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' };

// GET /api/duel/latest -> the most recently completed duels, site-wide.
// Powers the quiz-hub Duel tile's flip face (reads `duel`) and the quizzes
// home header ticker (reads `duels`, the last few results). Names/scores
// only, no tokens or anons.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_duels')
      .select('quiz_id, challenger_name, challenger_score, opponent_name, opponent_score, winner, created_at')
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(6);
    if (error || !data || !data.length) return NextResponse.json({ duel: null, duels: [] });
    return NextResponse.json({ duel: data[0], duels: data }, { headers: CACHE_HEADERS });
  } catch (e) {
    return NextResponse.json({ duel: null, duels: [] });
  }
}
