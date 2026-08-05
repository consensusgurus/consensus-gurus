// Server-side contest board reads.
//
// Two RPCs from migration 46, merged here rather than in SQL:
//   quiz_contest_board(start, end, limit)  -> earned DURING the contest window
//   quiz_contest_carryin(before, limit)    -> everything earned BEFORE it
//
// They are merged in JS on purpose. The owner's rule is that existing referrers
// keep the contributions they had already made, so a standing is
// carry-in + earned. Doing that as a third SQL function would mean a third copy
// of the scoring arithmetic to keep in sync; doing it here means the weights
// live in exactly two places (lib/contest.js and the two SQL functions) and the
// split stays visible to the reader, which is what the surface shows.
//
// Every read is best-effort: the contest is a promo, and it must never be able
// to take down the quizzes home page. A failed read yields an empty board.

import { CONTEST, contestScore } from './contest.js';

function isMissingSchema(err) {
  const m = (err && (err.message || err.details || '')) || '';
  return /does not exist|schema cache|could not find/i.test(m);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function emptyRow(username, refCode) {
  return { username, refCode, users: 0, sessions: 0, plays: 0, score: 0 };
}

function addInto(target, row) {
  target.users += num(row.users);
  target.sessions += num(row.sessions);
  target.plays += num(row.plays);
  return target;
}

// Recompute the score from the merged components rather than summing the two
// RPCs' score columns. Same answer, but it means a weight change in
// lib/contest.js is reflected here even before the migration is re-run, so the
// two can never disagree silently on the surface.
function scored(row) {
  return { ...row, score: contestScore(row) };
}

// The combined board: carry-in folded into window earnings, ranked.
//
// `limit` bounds the RETURNED rows, not the computation. Both RPCs are read at
// a high limit so the merge sees the whole field, otherwise someone with a big
// carry-in but a quiet week could be truncated out of the window read and lose
// their standing.
export async function contestBoard(admin, { limit = 25, includeCarryIn = true } = {}) {
  const out = new Map(); // refCode -> row

  const { data: win, error: winErr } = await admin.rpc('quiz_contest_board', {
    p_start: CONTEST.startsAt,
    p_end: CONTEST.endsAt,
    p_limit: 100000,
  });
  if (winErr) {
    if (isMissingSchema(winErr)) return { rows: [], ready: false };
    return { rows: [], ready: true };
  }
  for (const r of win || []) {
    if (!r.ref_code) continue;
    const key = String(r.ref_code).toLowerCase();
    const row = out.get(key) || emptyRow(r.username, r.ref_code);
    addInto(row, r);
    row.earned = contestScore({
      users: num(r.users),
      sessions: num(r.sessions),
      plays: num(r.plays),
    });
    out.set(key, row);
  }

  if (includeCarryIn) {
    const { data: carry } = await admin.rpc('quiz_contest_carryin', {
      p_before: CONTEST.startsAt,
      p_limit: 100000,
    });
    for (const r of carry || []) {
      if (!r.ref_code) continue;
      const key = String(r.ref_code).toLowerCase();
      const row = out.get(key) || emptyRow(r.username, r.ref_code);
      addInto(row, r);
      row.carryIn = contestScore({
        users: num(r.users),
        sessions: num(r.sessions),
        plays: num(r.plays),
      });
      out.set(key, row);
    }
  }

  const rows = [...out.values()]
    .map(scored)
    .map((r) => ({ earned: 0, carryIn: 0, ...r }))
    .sort((a, b) => b.score - a.score || b.users - a.users || String(a.username || '').localeCompare(String(b.username || '')))
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return { rows: rows.slice(0, limit), total: rows.length, ready: true, all: rows };
}

// One user's standing, with a TRUE rank taken from the full merged field.
// Returns null when they have no referrals at all in either period.
export async function contestStanding(admin, user) {
  if (!user || !user.ref_code) return null;
  const { rows, all } = await contestBoard(admin, { limit: 1 });
  const field = all || rows || [];
  const key = String(user.ref_code).toLowerCase();
  const mine = field.find((r) => String(r.refCode || '').toLowerCase() === key);
  if (!mine) return null;
  return { ...mine, fieldSize: field.length };
}

// Eligibility to WIN, as distinct from eligibility to SEE the promo.
// An account with no email cannot be contacted or paid, and per the known
// sign-in lockout cannot even recover its own account, so it is excluded from
// the board by the SQL and told why by the surface.
export function winEligibility(user) {
  const hasEmail = !!(user && typeof user.email === 'string' && user.email.trim());
  return {
    eligible: hasEmail,
    reason: hasEmail ? null : 'no_email',
  };
}
