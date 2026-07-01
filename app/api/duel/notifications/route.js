import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/notifications?anonId=...
// challenges: incoming duels you can still play (you're the opponent, no score,
//             not finished/declined) -> Play, Turn down, or Mute.
// results:    duels involving you that are complete or declined -> outcome.
export async function GET(request) {
  try {
    const anonId = (new URL(request.url).searchParams.get('anonId') || '').trim().slice(0, 64);
    if (!anonId) return NextResponse.json({ challenges: [], results: [] });
    const { data: ch } = await supabaseAdmin
      .from('quiz_duels')
      .select('token, quiz_id, challenger_anon, challenger_name, challenger_score, device, created_at')
      .eq('opponent_anon', anonId)
      .is('opponent_score', null)
      .neq('status', 'complete')
      .neq('status', 'declined')
      .order('created_at', { ascending: false })
      .limit(10);
    const { data: res } = await supabaseAdmin
      .from('quiz_duels')
      .select('token, quiz_id, challenger_anon, challenger_name, challenger_score, opponent_anon, opponent_name, opponent_score, status, winner, completed_at')
      .or(`challenger_anon.eq.${anonId},opponent_anon.eq.${anonId}`)
      .in('status', ['complete', 'declined'])
      .order('completed_at', { ascending: false })
      .limit(20);
    return NextResponse.json({ challenges: ch || [], results: res || [] });
  } catch (e) {
    return NextResponse.json({ challenges: [], results: [] });
  }
}
