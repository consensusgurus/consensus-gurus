import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { resolveAnonSet } from '@/lib/quiz-identity';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/duel/pending?anonId=...&email=...
// Duels where this ACCOUNT is the named opponent and hasn't posted a score yet.
export async function GET(request) {
  try {
    const sp = new URL(request.url).searchParams;
    const anonId = (sp.get('anonId') || '').trim().slice(0, 64);
    const email = (sp.get('email') || '').trim() || null;
    if (!anonId) return NextResponse.json({ pending: [] });
    const anons = await resolveAnonSet(supabaseAdmin, { anonId, email });
    const { data, error } = await supabaseAdmin
      .from('quiz_duels')
      .select('token, quiz_id, challenger_name, challenger_score, created_at')
      .in('opponent_anon', anons)
      .is('opponent_score', null)
      .neq('status', 'complete')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) return NextResponse.json({ pending: [] });
    return NextResponse.json({ pending: data || [] });
  } catch (e) {
    return NextResponse.json({ pending: [] });
  }
}
