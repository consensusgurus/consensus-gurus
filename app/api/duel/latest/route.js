import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/latest -> the most recently completed duel, site-wide.
// Powers the quiz-hub Duel tile's flip face (latest result teaser that
// links to the Duel Leaderboard). Names/scores only, no tokens or anons.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_duels')
      .select('quiz_id, challenger_name, challenger_score, opponent_name, opponent_score, winner, created_at')
      .eq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(1);
    if (error || !data || !data.length) return NextResponse.json({ duel: null });
    return NextResponse.json({ duel: data[0] });
  } catch (e) {
    return NextResponse.json({ duel: null });
  }
}
