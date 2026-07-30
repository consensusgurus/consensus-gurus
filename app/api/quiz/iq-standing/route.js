import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResults } from '@/lib/quiz-results-load';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { computeXp, rankPlayers } from '@/lib/quiz-xp';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// GET /api/quiz/iq-standing?anonId=&email=[&game=<dailyKey>][&quizId=][&span=2]
// Powers the IQ Points tile on the daily end card: what the game just finished
// paid, what the player has banked today, and their slot in the global IQ
// ranking with `span` players above and below.
//
// Per-player, so it is never CDN-cached — but it reads the same in-process
// quiz_results cache every other stats route uses, so the marginal cost over
// /api/quiz/daily-combined (already fetched by the same card) is the ranking
// sort, not another table scan.
//
// `gained` is deliberately NULL until the just-finished /api/quiz/result row is
// visible. The card POSTs that row as it mounts, so the first read here often
// predates it; reporting null lets the client retry instead of showing the
// PREVIOUS game's number as if it were this one. Identify the row by exact
// `quizId` when the caller knows it, else by `game` (the daily key) matched
// against today's Eastern date — daily quizIds are `<key>-<M>-<D>-<YY>` and no
// daily key is a prefix of another, so the prefix match is unambiguous.

const ET = 'America/New_York';
function etDate(ts) {
  try { return new Date(ts).toLocaleDateString('en-CA', { timeZone: ET }); }
  catch (e) { return String(ts || '').slice(0, 10); }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  const quizId = (searchParams.get('quizId') || '').trim() || null;
  const game = (searchParams.get('game') || '').trim() || null;
  const span = Math.min(5, Math.max(1, Number(searchParams.get('span')) || 2));
  try {
    let myKey = null, signed = false, username = null;
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (ident && ident.id) { myKey = `u:${ident.id}`; signed = true; username = ident.username || null; }
    else if (anonId) { myKey = `a:${anonId}`; }
    if (!myKey) return NextResponse.json({ found: false });

    const { data, error } = await loadQuizResults(supabaseAdmin);
    if (error) { console.error('iq-standing error', error); return NextResponse.json({ found: false }); }
    // recentN covers a full day's daily slate with room to spare, so "banked
    // today" is a complete sum rather than a truncated one.
    const { players } = computeXp(data || [], { recentN: 200 });
    const me = players.get(myKey);
    if (!me) return NextResponse.json({ found: false, signed, username });

    // Guests are ranked here exactly as they are on /api/quiz/xp (every
    // anonymous player gets a numbered slot); `provisional` tells the card to
    // badge the rank as unclaimed rather than hide it.
    const ranked = rankPlayers(players, 'all');
    const idx = ranked.findIndex((p) => p.key === myKey);
    // Always return the full 2*span+1 rows when the board is that long, sliding
    // the window instead of truncating it: the #1 player would otherwise see only
    // themselves plus two below, and the last player only two above.
    const size = span * 2 + 1;
    // Clamp so the window never runs off the end (a board of exactly `size`
    // viewed from its last rank would otherwise slice short and return 3 rows).
    const from = Math.max(0, Math.min(Math.max(0, idx - span), ranked.length - size));
    const windowRows = idx < 0 ? [] : ranked.slice(from, from + Math.min(size, ranked.length)).map((p, i) => ({
      rank: from + i + 1,
      name: p.name,
      xp: Math.round(p.xp),
      level: p.level,
      me: p.key === myKey,
    }));

    const recent = Array.isArray(me.recent) ? me.recent : [];
    const today = etDate(Date.now());
    const row = quizId
      ? recent.find((r) => r.quizId === quizId)
      : (game
        ? recent.find((r) => r.quizId && r.quizId.startsWith(game + '-') && etDate(r.createdAt) === today)
        : recent[0]);
    const todayGained = Math.round(recent
      .filter((r) => r.createdAt && etDate(r.createdAt) === today)
      .reduce((s, r) => s + (Number(r.xp) || 0), 0));

    return NextResponse.json({
      found: true,
      signed,
      username,
      provisional: !signed,
      xp: Math.round(me.xp),
      level: me.level,
      rank: idx >= 0 ? idx + 1 : null,
      total: ranked.length,
      gained: row ? Math.round(row.xp) : null,
      gainedFor: row ? row.quizId : null,
      todayGained,
      window: windowRows,
    });
  } catch (e) {
    console.error('iq-standing exception', e);
    return NextResponse.json({ found: false });
  }
}
