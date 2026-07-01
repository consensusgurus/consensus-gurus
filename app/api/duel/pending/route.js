import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/pending?anonId=...
// Duels where this player is the named opponent, the challenger has posted a
// score, and this player has not yet -> "someone challenged you, your move".
export async function GET(request) {
  try {
    const anonId = (new URL(request.url).searchParams.get('anonId') || '').trim().slice(0, 64);
    if (!anonId) return NextResponse.json({ pending: [] });
    const { data, error } = await supabaseAdmin
      .from('quiz_duels')
      .select('token, quiz_id, challenger_name, challenger_score, created_at')
      .eq('opponent_anon', anonId)
      .is('opponent_score', null)
      .not('challenger_score', 'is', null)
      .neq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) return NextResponse.json({ pending: [] });
    return NextResponse.json({ pending: data || [] });
  } catch (e) {
    return NextResponse.json({ pending: [] });
  }
}
