import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { computeElo, rankPlayers, eloTier, displayHandle, ELO_START, ELO_K } from '@/lib/quiz-elo';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/me?anonId=&email=[&scope=<dept>]
// The current player's full Elo profile + activity stats, derived from
// quiz_results (no DB changes). Resolves the player by the same identity the
// quiz client stores in localStorage:
//   - sot_quiz_identity.email  -> signed account (key u:<user_id>)
//   - sot_quiz_anon            -> guest browser   (key a:<anon_id>)
// findQuizIdentity() upgrades an anon to a signed account when the email/anon
// maps to a quiz_users row.
//
// Returns rating, overall rank (#N of M), per-category stats (incl. ELO),
// rating components, recent matches, and correct/played/completed/accuracy.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  const scope = (searchParams.get('scope') || 'all').trim() || 'all';

  try {
    // Resolve identity: a signed account wins, else fall back to the guest key.
    let myKey = null;
    let signed = false;
    let username = null;
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (ident && ident.id) { myKey = `u:${ident.id}`; signed = true; username = ident.username || null; }
    else if (anonId) { myKey = `a:${anonId}`; }

    const { data, error } = await fetchAllRows(
      supabaseAdmin,
      'quiz_results',
      'id, user_id, username, quiz_id, score, total, anon_id, created_at',
      ['id'],
    );
    if (error) {
      console.error('quiz me error', error);
      return NextResponse.json({ found: false });
    }

    const { players } = computeElo(data || []);
    const ranked = rankPlayers(players, 'all');
    const total = ranked.length;

    if (!myKey || !players.has(myKey)) {
      // No games on record yet for this identity.
      return NextResponse.json({
        found: false, signed, username, totalPlayers: total,
        rating: ELO_START, k: ELO_K, start: ELO_START,
      });
    }

    const p = players.get(myKey);
    const idx = ranked.findIndex((r) => r.key === myKey);
    const rank = idx >= 0 ? idx + 1 : null;
    const tier = eloTier(p.rating);
    const name = signed && username ? username : displayHandle(p);

    // Recent matches enriched, already newest-first from computeElo.
    const recent = p.recent.map((m) => ({ ...m }));

    return NextResponse.json({
      found: true,
      signed,
      isAnon: p.isAnon,
      name,
      totalPlayers: total,
      rank,
      rating: p.rating,
      tier: tier.label,
      tierBg: tier.bg,
      tierFg: tier.fg,
      components: {
        start: p.start,
        k: p.k,
        matches: p.matches,
        netDelta: p.netDelta,
        rating: p.rating,
      },
      activity: {
        correct: p.correct,
        answered: p.answered,
        played: p.played,
        completed: p.completed,
        accuracy: p.accuracy,
      },
      byCategory: p.byCategory, // { cat: { rating, matches, netDelta } }
      recent,
    });
  } catch (e) {
    console.error('quiz me exception', e);
    return NextResponse.json({ found: false });
  }
}
