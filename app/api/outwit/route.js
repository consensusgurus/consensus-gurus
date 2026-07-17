import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { PUZZLES } from '@/app/outwit/puzzles';

// POST /api/outwit  { quizId, answers:[5], anonId, email? }
//
// Scores one Outwit run against the day's pool: the pre-written ~48-answer
// "house crowd" (server-only, in app/outwit/puzzles.js) + every real pick
// recorded so far + this submission. Scoring is INSTANT AND FINAL at play time
// (owner ruling 2026-07-17): the pool only grows, so later players face a
// bigger crowd, and the house seed keeps 12:01am fair.
//
// Picks are stored in `outwit_picks` (migration 35), one row per (quiz_id,
// anon_id) — replays are re-scored against the live pool but never re-inserted,
// so nobody can stuff the ballot by replaying. If the table doesn't exist yet
// (migration not run), the game still works: pool = house crowd only.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

function fmtNum(x) {
  const v = Math.round(x);
  if (Math.abs(v) >= 1e6) return `${Math.round(v / 1e5) / 10}M`;
  if (Math.abs(v) >= 10000) return `${Math.round(v / 1000)}k`;
  if (Math.abs(v) >= 1000) return `${Math.round(v / 100) / 10}k`;
  return String(v);
}

// Points from closeness percentile: strictly-closer fraction of the pool.
// Top third of the field -> 2, middle third -> 1, bottom -> 0.
function closenessPts(pool, you, target) {
  const myD = Math.abs(you - target);
  let closer = 0, farther = 0;
  for (const v of pool) {
    const d = Math.abs(v - target);
    if (d < myD) closer++;
    else if (d > myD) farther++;
  }
  const frac = closer / pool.length;
  return { pts: frac < 1 / 3 ? 2 : frac < 2 / 3 ? 1 : 0, beatPct: Math.round((farther / pool.length) * 100) };
}

// Reveal histogram for numeric prompts: 8 equal buckets across the pool's
// 5th..95th percentile span (outliers clamp into the edge buckets).
function histogram(pool, you, target) {
  const s = [...pool].sort((a, b) => a - b);
  const lo = s[Math.floor(s.length * 0.05)];
  const hi = s[Math.min(s.length - 1, Math.floor(s.length * 0.95))];
  const span = Math.max(1, hi - lo);
  const N = 8;
  const idxOf = (v) => Math.max(0, Math.min(N - 1, Math.floor(((v - lo) / span) * N)));
  const buckets = Array.from({ length: N }, (_, i) => ({
    label: `${fmtNum(lo + (span * i) / N)}–${fmtNum(lo + (span * (i + 1)) / N)}`,
    count: 0, you: false, target: false,
  }));
  for (const v of pool) buckets[idxOf(v)].count++;
  buckets[idxOf(you)].you = true;
  buckets[idxOf(target)].target = true;
  return buckets;
}

function scorePrompt(pr, priorAnswers, you) {
  const poolSize = pr.house.length + priorAnswers.length + 1;
  if (pr.type === 'twothirds' || pr.type === 'herd') {
    const pool = [...pr.house, ...priorAnswers, you];
    const target = pr.type === 'twothirds' ? (2 / 3) * mean(pool) : median(pool);
    const { pts, beatPct } = closenessPts(pool, you, target);
    const out = {
      type: pr.type, tag: pr.tag, q: pr.q, yourAnswer: you, pts, poolSize,
      target: Math.round(target * 10) / 10,
      median: Math.round(median(pool) * 10) / 10,
      beatPct,
      buckets: histogram(pool, you, target),
    };
    if (pr.type === 'herd' && pr.truth != null) { out.truth = pr.truth; out.truthNote = pr.truthNote || null; }
    return out;
  }
  // choice + unique prompts: rank by pool counts
  if (pr.type === 'least' || pr.type === 'match') {
    const counts = new Array(pr.options.length).fill(0);
    for (const v of [...pr.house, ...priorAnswers, you]) { if (Number.isInteger(v) && v >= 0 && v < counts.length) counts[v]++; }
    const order = counts.map((c, i) => ({ c, i })).sort((a, b) => (pr.type === 'least' ? a.c - b.c : b.c - a.c) || a.i - b.i);
    const rank = order.findIndex((o) => o.i === you);
    const pts = rank === 0 ? 2 : rank === 1 ? 1 : 0;
    return { type: pr.type, tag: pr.tag, q: pr.q, options: pr.options, yourAnswer: you, pts, poolSize, counts, winner: order[0].i };
  }
  // unique: rarest number in [min..max] wins, ties to the lower number
  const size = pr.max - pr.min + 1;
  const counts = new Array(size).fill(0);
  for (const v of [...pr.house, ...priorAnswers, you]) { const k = v - pr.min; if (Number.isInteger(v) && k >= 0 && k < size) counts[k]++; }
  const order = counts.map((c, i) => ({ c, i })).sort((a, b) => a.c - b.c || a.i - b.i);
  const rank = order.findIndex((o) => o.i === you - pr.min);
  const pts = rank < 4 ? 2 : rank < 10 ? 1 : 0;
  return { type: pr.type, tag: pr.tag, q: pr.q, min: pr.min, max: pr.max, yourAnswer: you, pts, poolSize, counts, winner: order[0].i + pr.min };
}

function etTodayServer() {
  try { return new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }); }
  catch (e) { return new Date().toISOString().slice(0, 10); }
}

export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const quizId = typeof body.quizId === 'string' ? body.quizId.trim() : '';
    const anonId = typeof body.anonId === 'string' && body.anonId.trim() ? body.anonId.trim().slice(0, 64) : null;
    const email = typeof body.email === 'string' && body.email.trim() ? body.email.trim() : null;
    const answers = Array.isArray(body.answers) ? body.answers : null;

    const puzzle = PUZZLES.find((p) => p.quizId === quizId);
    if (!puzzle) return NextResponse.json({ error: 'unknown quizId' }, { status: 400 });
    if (puzzle.live > etTodayServer()) return NextResponse.json({ error: 'not live yet' }, { status: 400 });
    if (!answers || answers.length !== puzzle.prompts.length) {
      return NextResponse.json({ error: 'answers required' }, { status: 400 });
    }
    // validate each answer against its prompt
    const clean = [];
    for (let i = 0; i < puzzle.prompts.length; i++) {
      const pr = puzzle.prompts[i];
      const v = Number(answers[i]);
      if (!Number.isInteger(v)) return NextResponse.json({ error: `answer ${i + 1} invalid` }, { status: 400 });
      if (pr.options) {
        if (v < 0 || v >= pr.options.length) return NextResponse.json({ error: `answer ${i + 1} out of range` }, { status: 400 });
      } else if (v < pr.min || v > pr.max) {
        return NextResponse.json({ error: `answer ${i + 1} out of range` }, { status: 400 });
      }
      clean.push(v);
    }

    // Real picks so far. Table may not exist yet (migration 35 not run) — the
    // game degrades gracefully to the house pool alone.
    let rows = [];
    try {
      const { data, error } = await supabaseAdmin
        .from('outwit_picks')
        .select('anon_id, answers')
        .eq('quiz_id', quizId)
        .limit(20000);
      if (!error && Array.isArray(data)) rows = data;
    } catch (e) { /* table missing — house pool only */ }
    // A replaying player's own first pick is already in `rows`; exclude it so
    // their replay isn't scored against themselves twice.
    const priorLists = rows.filter((r) => !anonId || r.anon_id !== anonId).map((r) => r.answers).filter((a) => Array.isArray(a));
    const alreadyPlayed = anonId ? rows.some((r) => r.anon_id === anonId) : false;

    const prompts = puzzle.prompts.map((pr, i) => {
      const prior = priorLists.map((a) => Number(a[i])).filter((x) => Number.isInteger(x));
      return scorePrompt(pr, prior, clean[i]);
    });
    const points = prompts.reduce((s, p) => s + p.pts, 0);

    // Record the pick (first submission per browser only; replays never insert).
    if (anonId && !alreadyPlayed) {
      try {
        let userId = null;
        try {
          const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
          if (ident && ident.id) userId = ident.id;
        } catch (e) { /* best-effort */ }
        await supabaseAdmin
          .from('outwit_picks')
          .upsert({ quiz_id: quizId, anon_id: anonId, user_id: userId, answers: clean }, { onConflict: 'quiz_id,anon_id', ignoreDuplicates: true });
      } catch (e) { /* table missing — scoring still returned */ }
    }

    return NextResponse.json({
      ok: true,
      quizId,
      points,
      total: puzzle.prompts.length * 2,
      poolSize: prompts[0] ? prompts[0].poolSize : 0,
      replay: alreadyPlayed,
      prompts,
    });
  } catch (e) {
    console.error('outwit error', e);
    return NextResponse.json({ error: 'server error' }, { status: 500 });
  }
}
