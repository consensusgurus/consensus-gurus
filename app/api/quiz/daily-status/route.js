import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached } from '@/lib/quiz-results-cache';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { computeXpCached, dailyStandingCached } from '@/lib/quiz-derived-cache';

// Midnight "today" in US Eastern (handles EST/EDT) as a UTC epoch ms. Same
// helper as /api/quiz/today and /api/quiz/totals, so all three roll over
// together. Computed ONCE per request, which is the whole point: see the note
// on gainedToday below.
function startOfEasternTodayUTC() {
  const tz = 'America/New_York';
  const now = new Date();
  const ymd = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  for (const offH of [4, 5]) {
    const guess = Date.parse(`${ymd}T00:00:00.000Z`) + offH * 3600 * 1000;
    const p = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false })
      .formatToParts(new Date(guess))
      .reduce((a, x) => { a[x.type] = x.value; return a; }, {});
    if (`${p.year}-${p.month}-${p.day}` === ymd && p.hour === '00') return guess;
  }
  return Date.parse(`${ymd}T04:00:00.000Z`);
}

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
// Per-player, small payload, safe to cache briefly at the edge (the query string
// is the player's own identity, so cache entries never cross users).
const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=90' };

// Daily-game quizIds look like `<game>-<M>-<D>-<YY>` (e.g. crux-7-14-26). This
// matches only those, so a normal quiz that happens to share a prefix can't leak
// in.
const DAILY_RE = /^(crux|emcee|garble|links|span|dating|tally|suds|circa|extra|carve|stet|outwit|tuck|alibi|cipher|ping|warmer|jester|sworn|outrank|shards|axiom|hearsay|venn|stands|bracket|lode|etch|hedge|listed|mate|four|park|check|rung|crunch|taire|fib|streak|feud|babel|glyph|hands|chain|turn|suffice|strata|redact)-\d+-\d+-\d+$/;

// GET /api/quiz/daily-status?anonId=&email=
// The player's daily-game history, resolved by the identity the quiz client
// stores (email -> account, else this browser's anon). Lets /daily and the
// end-screen cross-promo show played/completed marks that FOLLOW THE USER across
// devices — localStorage only knows this one browser. Reads the shared in-process
// quiz_results cache (no fresh full-table query) per the egress guardrails.
// Also returns `todayXp` (IQ Points earned today, ET, across every game) and
// `rankChange` (places climbed on the global IQ board since the day started,
// negative = dropped, null = no standing to move from). Both feed the "Your day"
// strip.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const anonId = (searchParams.get('anonId') || '').trim() || null;
  const email = (searchParams.get('email') || '').trim() || null;
  try {
    let myKey = null;
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (ident && ident.id) myKey = `u:${ident.id}`;
    else if (anonId) myKey = `a:${anonId}`;
    if (!myKey) return NextResponse.json({ played: [], completed: [], abandoned: [] }, { headers: CACHE_HEADERS });

    const { data, error } = await loadQuizResultsCached(supabaseAdmin);
    if (error) {
      console.error('daily-status error', error);
      return NextResponse.json({ played: [], completed: [], abandoned: [] });
    }
    const played = new Set();
    const completed = new Set();
    const abandonedOnly = new Set();
    // Per-game archive progress, free from this same pass: how many of a game's
    // days this player has played, over how many days that game has ever run.
    // The denominator counts DISTINCT dated ids across every player's rows,
    // which is the same set the per-game archive calendar draws from, so the
    // closed row can show the figure without waiting on the drawer's own fetch.
    const archiveAll = new Map();   // game key -> Set(dated quiz id)
    const archiveMine = new Map();
    const bump = (m, key, qid) => { let v = m.get(key); if (!v) { v = new Set(); m.set(key, v); } v.add(qid); };
    for (const r of (data || [])) {
      const qid = r && r.quiz_id;
      if (!qid || !DAILY_RE.test(qid)) continue;
      const gkey = qid.slice(0, qid.indexOf('-'));
      bump(archiveAll, gkey, qid);
      const pk = r.user_id ? `u:${r.user_id}` : (r.anon_id ? `a:${r.anon_id}` : null);
      if (pk !== myKey) continue;
      if (!r.abandoned) bump(archiveMine, gkey, qid);
      // An abandoned in-progress row (opened the board, made a move, then left
      // before finishing) is NOT a played game. It still counts as a play for
      // the leaderboard fallback in daily-combined, but here it is reported
      // separately as `abandoned` (started, not finished), never played/completed.
      if (r.abandoned) { abandonedOnly.add(qid); continue; }
      played.add(qid);
      if (r.total > 0 && r.score === r.total) completed.add(qid);
    }
    // Report a game as abandoned only when the player never finished it.
    const abandoned = [...abandonedOnly].filter((q) => !played.has(q));
    // Per-game consecutive-day streaks (ET days), counted back from today.
    // Today is optional (a live streak shows before the player has played
    // today's puzzle); any earlier missing day breaks the chain. Only finished
    // games count (abandoned rows never reach `played`). Streaks under 2 are
    // omitted; lookback capped so the loop stays trivial.
    const streaks = {};
    try {
      const et = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const byGame = new Map();
      for (const qid of played) {
        const m = /^([a-z]+)-(\d+)-(\d+)-(\d+)$/.exec(qid);
        if (!m) continue;
        if (!byGame.has(m[1])) byGame.set(m[1], new Set());
        byGame.get(m[1]).add(`${m[2]}-${m[3]}-${m[4]}`);
      }
      const MAX_BACK = 120;
      for (const [g, days] of byGame) {
        let s = 0;
        for (let i = 0; i < MAX_BACK; i++) {
          const d = new Date(et); d.setDate(et.getDate() - i);
          const key = `${d.getMonth() + 1}-${d.getDate()}-${d.getFullYear() % 100}`;
          if (days.has(key)) s++;
          else if (i === 0) continue;
          else break;
        }
        if (s >= 2) streaks[g] = s;
      }
    } catch (e) {}
    // Today's IQ Points (ET), for the "Your day" strip. Computed HERE rather than
    // in its own request because this route already holds the rows and the strip
    // already fetches it, and the 30s edge cache bounds the cost of the full
    // computeXp pass. IQ needs per-quiz difficulty, which is derived from every
    // row, so there is no cheaper single-player shortcut. Wrapped so a failure
    // degrades to null instead of breaking played/completed, this route's real job.
    let todayXp = null;
    let rankChange = null;
    try {
      // computeXpCached, not computeXp: this derivation is identical for every route
      // and every player against the same rows, and it walks all ~34,700 of them.
      // Going through the shared memo means the first caller after a row lands pays
      // and the rest get a map lookup.
      const { players } = computeXpCached(data || [], { recentN: 400 });
      const me = players.get(myKey);
      if (me) {
        // Today's gain and the two field-wide rankings (now, and on the IQ
        // everyone held before today) are the same for every player against the
        // same rows, so they are memoized per row set + ET day. Ranking the field
        // twice this way counts OTHER players passing you, which a sum of your
        // own per-play rankDelta would miss; only the lookup below is personal.
        const dayStart = startOfEasternTodayUTC();
        const { gained, posNow, posThen } = dailyStandingCached(data || [], players, { dayStartMs: dayStart, recentN: 400 });

        const mineToday = gained.get(myKey) || 0;
        todayXp = Math.round(mineToday);

        // A player whose first ever game is today had no standing to move from.
        if ((me.xp || 0) - mineToday > 0) {
          const now = posNow.get(myKey) || 0;
          const then = posThen.get(myKey) || 0;
          if (now > 0 && then > 0) rankChange = then - now; // positive = climbed
        }
      }
    } catch (e) { console.error('daily-status todayXp', e); }
    const archive = {};
    for (const [k, all] of archiveAll) {
      archive[k] = { total: all.size, played: (archiveMine.get(k) || new Set()).size };
    }
    return NextResponse.json({ played: [...played], completed: [...completed], abandoned, streaks, todayXp, rankChange, archive }, { headers: CACHE_HEADERS });
  } catch (e) {
    console.error('daily-status exception', e);
    return NextResponse.json({ played: [], completed: [], abandoned: [] });
  }
}
