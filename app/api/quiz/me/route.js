import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResults } from '@/lib/quiz-results-load';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { computeXp } from '@/lib/quiz-xp';
import { buildProfile } from '@/lib/quiz-profile';
import { computeTrophies, buildTrophyList } from '@/lib/quiz-trophies';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/me?anonId=&email=
// The current player's full XP profile + activity, resolved by the identity the
// quiz client stores in localStorage (email -> u:<id>, else anon -> a:<anon>).
// Includes the trophy case (minus the duels group: the quiz_duels tally is a
// per-view query this hot path skips; /api/quiz/player carries it).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  try {
    let myKey = null, signed = false, username = null;
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (ident && ident.id) { myKey = `u:${ident.id}`; signed = true; username = ident.username || null; }
    else if (anonId) { myKey = `a:${anonId}`; }

    const { data, error } = await loadQuizResults(supabaseAdmin);
    if (error) { console.error('quiz me error', error); return NextResponse.json({ found: false }); }
    // recentN large so the Stat Hub Activity log shows the player's FULL play
    // history (every game, exact timestamps), not just the last handful.
    const { players } = computeXp(data || [], { recentN: 100000, rankFor: myKey });
    const profile = buildProfile(players, myKey, { signed, username });
    if (profile.found) {
      const res = computeTrophies(data || [], players);
      profile.trophies = buildTrophyList(res, myKey, { includeDuels: false });
    }
    return NextResponse.json(profile);
  } catch (e) {
    console.error('quiz me exception', e);
    return NextResponse.json({ found: false });
  }
}
