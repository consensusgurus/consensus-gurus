import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResults } from '@/lib/quiz-results-load';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { computeXpCached, computeTrophiesCached } from '@/lib/quiz-derived-cache';
import { buildProfile } from '@/lib/quiz-profile';
import { buildTrophyList } from '@/lib/quiz-trophies';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/me?anonId=&email=&light=
// The current player's full XP profile + activity, resolved by the identity the
// quiz client stores in localStorage (email -> u:<id>, else anon -> a:<anon>).
// Includes the trophy case (minus the duels group: the quiz_duels tally is a
// per-view query this hot path skips; /api/quiz/player carries it).
//
// `light=1` returns the headline profile ONLY: level, activity, ranks, base and
// byCategory, with an empty `recent` and no `trophies`. Those two are the whole
// cost of this route (the per-play rank-movement simulation needs rankFor, and
// the trophy pass re-walks every row), and the surfaces that call it on page
// load, starting with the /quizzes homepage player bar, render neither. It is
// also why light is fast for EVERYONE: with no rankFor it shares one memo entry
// across all players, so the first request of a row-version pays and the rest
// are a map lookup. Callers that show the activity log or the trophy case
// (Stat Hub, player profile, the post-game unlock toast) simply omit the flag.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  const light = searchParams.get('light') === '1' || searchParams.get('light') === 'true';
  try {
    let myKey = null, signed = false, username = null;
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (ident && ident.id) { myKey = `u:${ident.id}`; signed = true; username = ident.username || null; }
    else if (anonId) { myKey = `a:${anonId}`; }

    const { data, error } = await loadQuizResults(supabaseAdmin);
    if (error) { console.error('quiz me error', error); return NextResponse.json({ found: false }); }
    // Full mode: recentN large so the Stat Hub Activity log shows the player's
    // FULL play history (every game, exact timestamps), not just the last
    // handful, and rankFor so each of those entries carries its rank movement.
    // Light mode drops both, which is what makes its memo entry shareable.
    // ⚠️ recentN 1, NOT 0. computeXp finalizes with `p.recent.slice(-recentN)`,
    // and slice(-0) is slice(0), i.e. the WHOLE array: asking for zero recent
    // entries returns every one of them. Shipped that way for one deploy and a
    // light profile still carried 710 entries / 20KB. Ask for the smallest real
    // slice and drop it below.
    const { players } = light
      ? computeXpCached(data || [], { recentN: 1 })
      : computeXpCached(data || [], { recentN: 100000, rankFor: myKey });
    const profile = buildProfile(players, myKey, { signed, username });
    // buildProfile copies `recent` into a fresh array, so emptying it here can
    // never reach back into the shared memo entry.
    if (light) profile.recent = [];
    if (!light && profile.found) {
      const res = computeTrophiesCached(data || [], players);
      profile.trophies = buildTrophyList(res, myKey, { includeDuels: false });
    }
    return NextResponse.json(profile);
  } catch (e) {
    console.error('quiz me exception', e);
    return NextResponse.json({ found: false });
  }
}
