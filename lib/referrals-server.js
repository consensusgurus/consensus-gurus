// Server side of the referral system. See lib/referrals.js for the capture flow.
//
// Everything here is best-effort and NEVER throws into its caller: referral
// credit is a side feature of recording a game, so a missing migration, a bad
// code, or a race must never cost a player their result.

import { normalizeRefCode } from './referrals';

// Postgres / PostgREST "this schema object does not exist yet" signals. The
// route is deployed before the migration is run by hand in the Supabase SQL
// editor, so every referral read/write has to degrade quietly in that window.
function isMissingSchema(err) {
  if (!err) return false;
  if (err.code === '42P01' || err.code === '42703') return true;          // undefined table / column
  if (err.code === 'PGRST204' || err.code === 'PGRST205') return true;    // schema cache miss
  return /column|relation|schema cache/i.test(err.message || '');
}

// A slug we can hand out as a share code. Mirrors the migration's backfill.
function slugFor(username, id) {
  const base = String(username || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24);
  const tail = String(id || '').replace(/-/g, '').slice(0, 4);
  return base || `player${tail}`;
}

// Look up a user's share code, minting one if they predate the backfill.
// Returns null when the column does not exist yet.
export async function ensureRefCode(admin, user) {
  if (!user || !user.id) return null;
  if (user.ref_code) return normalizeRefCode(user.ref_code);
  let candidate = slugFor(user.username, user.id);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data, error } = await admin
      .from('quiz_users')
      .update({ ref_code: candidate })
      .eq('id', user.id)
      .select('ref_code')
      .maybeSingle();
    if (!error && data) return normalizeRefCode(data.ref_code);
    if (isMissingSchema(error)) return null;
    if (error && error.code === '23505') {
      // Someone already holds that slug; disambiguate with the uuid tail.
      candidate = `${slugFor(user.username, user.id)}${String(user.id).replace(/-/g, '').slice(attempt * 4, attempt * 4 + 4)}`;
      continue;
    }
    return null;
  }
  return null;
}

// Credit the owner of `refCode` for bringing in the player identified by
// `visitorKey`. Writes at most ONE row per referred person, ever.
//
// Returns { credited: true } on a fresh credit, otherwise { credited: false }
// with a `reason` that is useful in logs but never surfaced to the client.
export async function creditReferral(admin, { refCode, visitorKey, userId = null, quizId = null }) {
  const code = normalizeRefCode(refCode);
  const key = typeof visitorKey === 'string' ? visitorKey.trim().slice(0, 128) : '';
  if (!code || !key) return { credited: false, reason: 'missing' };

  // Resolve the referrer. anon_id is pulled so we can reject self-referral from
  // the same browser (the cheapest possible way to farm your own board).
  const { data: referrer, error: refErr } = await admin
    .from('quiz_users')
    .select('id, anon_id')
    .ilike('ref_code', code)
    .maybeSingle();
  if (refErr || !referrer) return { credited: false, reason: 'no-referrer' };
  if (referrer.anon_id && referrer.anon_id === key) return { credited: false, reason: 'self' };
  if (userId && userId === referrer.id) return { credited: false, reason: 'self' };

  // Already attributed? First referrer keeps the credit. If the player has since
  // registered, backfill their user id onto the existing row and stop.
  const { data: existing, error: exErr } = await admin
    .from('quiz_referrals')
    .select('id, referred_user_id')
    .eq('referred_key', key)
    .maybeSingle();
  if (exErr && isMissingSchema(exErr)) return { credited: false, reason: 'no-table' };
  if (existing) {
    if (userId && !existing.referred_user_id) {
      await admin.from('quiz_referrals').update({ referred_user_id: userId }).eq('id', existing.id);
    }
    return { credited: false, reason: 'already' };
  }

  const { error: insErr } = await admin.from('quiz_referrals').insert({
    referrer_user_id: referrer.id,
    referred_key: key,
    referred_user_id: userId,
    quiz_id: quizId,
  });
  // 23505 = another request for the same visitor won the race. Not an error.
  if (insErr) return { credited: false, reason: insErr.code === '23505' ? 'race' : 'insert-failed' };
  return { credited: true };
}

// Rolling-window referral board. Falls back to a plain grouped read when the
// RPC is absent, and to an empty board when the table itself is absent.
export async function topReferrers(admin, { days = 30, limit = 10 } = {}) {
  const { data, error } = await admin.rpc('quiz_top_referrers', { p_days: days, p_limit: limit });
  if (!error && Array.isArray(data)) {
    return data.map((r) => ({ username: r.username, refCode: r.ref_code, credits: Number(r.credits) || 0 }));
  }
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data: rows, error: rowErr } = await admin
    .from('quiz_referrals')
    .select('referrer_user_id, created_at')
    .gte('created_at', since)
    .limit(5000);
  if (rowErr || !rows) return [];
  const tally = new Map();
  for (const r of rows) {
    const cur = tally.get(r.referrer_user_id) || { credits: 0, first: r.created_at };
    cur.credits += 1;
    if (r.created_at < cur.first) cur.first = r.created_at;
    tally.set(r.referrer_user_id, cur);
  }
  if (!tally.size) return [];
  const { data: users } = await admin
    .from('quiz_users')
    .select('id, username, ref_code')
    .in('id', [...tally.keys()]);
  const byId = new Map((users || []).map((u) => [u.id, u]));
  return [...tally.entries()]
    .map(([id, v]) => ({ username: byId.get(id)?.username || null, refCode: byId.get(id)?.ref_code || null, credits: v.credits, first: v.first }))
    .filter((r) => r.username)
    .sort((a, b) => b.credits - a.credits || (a.first < b.first ? -1 : 1))
    .slice(0, limit)
    .map(({ username, refCode, credits }) => ({ username, refCode, credits }));
}
