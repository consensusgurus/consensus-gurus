import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { computeElo } from '@/lib/quiz-elo';
import { buildProfile } from '@/lib/quiz-profile';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/me?anonId=&email=
// The current player's full Elo profile + activity, resolved by the identity the
// quiz client stores in localStorage (email -> u:<id>, else anon -> a:<anon>).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  try {
    let myKey = null, signed = false, username = null;
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (ident && ident.id) { myKey = `u:${ident.id}`; signed = true; username = ident.username || null; }
    else if (anonId) { myKey = `a:${anonId}`; }

    const { data, error } = await fetchAllRows(
      supabaseAdmin,
      'quiz_results',
      'id, user_id, username, quiz_id, score, total, anon_id, created_at',
      ['id'],
    );
    if (error) { console.error('quiz me error', error); return NextResponse.json({ found: false }); }
    const { players } = computeElo(data || [], { recentN: 60 });
    return NextResponse.json(buildProfile(players, myKey, { signed, username }));
  } catch (e) {
    console.error('quiz me exception', e);
    return NextResponse.json({ found: false });
  }
}
