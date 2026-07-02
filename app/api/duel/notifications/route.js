import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { resolveAnonSet, duelOrFilter } from '@/lib/quiz-identity';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/notifications?anonId=...&email=...
// challenges: incoming duels the ACCOUNT can still play (it's the opponent, no
//             score, not finished/declined). results: duels involving the
//             account that are complete or declined. Resolved across all the
//             account's browser anons.
export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const anonId = (sp.get('anonId') || '').trim().slice(0, 64);
    const email = (sp.get('email') || '').trim() || null;
    if (!anonId) return NextResponse.json({ challenges: [], results: [] });
    const anons = await resolveAnonSet(supabaseAdmin, { anonId, email });
    const { data: ch } = await supabaseAdmin
      .from('quiz_duels')
      .select('token, quiz_id, challenger_anon, challenger_name, challenger_score, device, created_at')
      .in('opponent_anon', anons)
      .is('opponent_score', null)
      .neq('status', 'complete')
      .neq('status', 'declined')
      .order('created_at', { ascending: false })
      .limit(10);
    const { data: res } = await supabaseAdmin
      .from('quiz_duels')
      .select('token, quiz_id, challenger_anon, challenger_name, challenger_score, opponent_anon, opponent_name, opponent_score, status, winner, completed_at')
      .or(duelOrFilter(anons))
      .in('status', ['complete', 'declined'])
      .order('completed_at', { ascending: false })
      .limit(20);
    return NextResponse.json({ challenges: ch || [], results: res || [] });
  } catch (e) {
    return NextResponse.json({ challenges: [], results: [] });
  }
}
