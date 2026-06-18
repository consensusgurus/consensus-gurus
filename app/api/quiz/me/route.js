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

    // Per-metric ranks + player-base averages across EVERY player (registered
    // AND anonymous — anon keys a:/r: are never filtered out). For each metric
    // we sort all players desc and find this player's 1-based position; the
    // base average is the mean of that metric over all players.
    const allPlayers = [...players.values()];
    const metricVal = {
      rating: (q) => q.rating,
      correct: (q) => q.correct,
      completed: (q) => q.completed,
      accuracy: (q) => q.accuracy,
      daysPlayed: (q) => q.daysPlayed || 0,
      played: (q) => q.played || 0,
    };
    function rankAndBase(getter, myVal) {
      const vals = allPlayers.map(getter);
      const n = vals.length || 1;
      const avg = vals.reduce((a, b) => a + (Number(b) || 0), 0) / n;
      // 1-based rank: 1 + count of players strictly greater than me.
      let greater = 0;
      for (const v of vals) if ((Number(v) || 0) > (Number(myVal) || 0)) greater += 1;
      return { rank: greater + 1, base: avg };
    }

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

    // Per-category ranks: for each category the current player has matches in,
    // rank them by that category's ELO (and by played count) among ALL players
    // who have matches in that category (anonymous included). Attached onto a
    // copy of byCategory as { rank, playedRank, catTotal }.
    const byCategoryRanked = {};
    for (const cat of Object.keys(p.byCategory)) {
      const mine = p.byCategory[cat];
      let eloGreater = 0;
      let playedGreater = 0;
      let catTotal = 0;
      for (const op of allPlayers) {
        const oc = op.byCategory[cat];
        if (!oc || !(oc.matches > 0)) continue;
        catTotal += 1;
        if ((oc.rating || 0) > (mine.rating || 0)) eloGreater += 1;
        if ((oc.played || 0) > (mine.played || 0)) playedGreater += 1;
      }
      byCategoryRanked[cat] = {
        ...mine,
        rank: eloGreater + 1,
        playedRank: playedGreater + 1,
        catTotal,
      };
    }

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
        daysPlayed: p.daysPlayed || 0,
      },
      // Per-metric rank (#N of totalPlayers) and player-base average, for the
      // Stat Hub "vs. Player Base" table and the metric "#rank" chips.
      ranks: {
        rating: rankAndBase(metricVal.rating, p.rating).rank,
        correct: rankAndBase(metricVal.correct, p.correct).rank,
        completed: rankAndBase(metricVal.completed, p.completed).rank,
        accuracy: rankAndBase(metricVal.accuracy, p.accuracy).rank,
        daysPlayed: rankAndBase(metricVal.daysPlayed, p.daysPlayed || 0).rank,
        played: rankAndBase(metricVal.played, p.played || 0).rank,
      },
      base: {
        rating: Math.round(rankAndBase(metricVal.rating, p.rating).base),
        correct: Math.round(rankAndBase(metricVal.correct, p.correct).base),
        completed: Math.round(rankAndBase(metricVal.completed, p.completed).base * 10) / 10,
        accuracy: Math.round(rankAndBase(metricVal.accuracy, p.accuracy).base * 10) / 10,
        daysPlayed: Math.round(rankAndBase(metricVal.daysPlayed, p.daysPlayed || 0).base * 10) / 10,
        played: Math.round(rankAndBase(metricVal.played, p.played || 0).base * 10) / 10,
      },
      byCategory: byCategoryRanked, // { cat: { rating, matches, played, rank, playedRank, catTotal } }
      recent,
    });
  } catch (e) {
    console.error('quiz me exception', e);
    return NextResponse.json({ found: false });
  }
}
