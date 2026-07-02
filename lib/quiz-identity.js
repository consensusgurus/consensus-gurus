// Shared leaderboard identity helpers for the quiz routes.
//
// Email is OPTIONAL. A player can join with just a display name; that identity
// is keyed by the browser's anon_id (the token sent with every game). Adding an
// email later is what lets them reconnect on another device. resolveQuizIdentity
// finds-or-creates the identity; attributeAnonGames links a browser's earlier
// anonymous games so the display name back-fills onto the leaderboard.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validEmail(e) {
  return typeof e === 'string' && EMAIL_RE.test(e.trim()) && e.trim().length <= 120;
}

// A display name must never be an email address. An '@' is never part of a real
// display name and almost always means a pasted email, which we keep off the
// public leaderboard.
export function looksLikeEmail(s) {
  return typeof s === 'string' && s.includes('@');
}

function cleanName(u) {
  return (typeof u === 'string' ? u.trim() : '').slice(0, 40);
}
function cleanAnon(a) {
  return typeof a === 'string' && a.trim() ? a.trim().slice(0, 64) : null;
}

// Read-only lookup used when recording a result (never creates a row).
export async function findQuizIdentity(admin, { email, anonId }) {
  const mail = validEmail(email) ? email.trim() : null;
  const anon = cleanAnon(anonId);
  if (mail) {
    const { data } = await admin.from('quiz_users').select('id, username').ilike('email', mail).maybeSingle();
    if (data) return data;
  }
  if (anon) {
    const { data, error } = await admin.from('quiz_users').select('id, username').eq('anon_id', anon).maybeSingle();
    if (!error && data) return data;
  }
  return null;
}

// True if a DIFFERENT identity already uses this display name (case-insensitive).
// ilike pre-filters case-insensitively; any % or _ in the name only widens the
// match, so the exact lowercase compare below is the authoritative test.
async function usernameTaken(admin, uname, selfId) {
  const want = (uname || '').trim().toLowerCase();
  if (!want) return false;
  const { data } = await admin.from('quiz_users').select('id, username').ilike('username', uname);
  if (!Array.isArray(data)) return false;
  return data.some((r) => r.id !== selfId && (r.username || '').trim().toLowerCase() === want);
}

// Find-or-create the identity. Returns { id, username, email }, null on error,
// or { error: 'username_taken' } when the display name belongs to someone else.
export async function resolveQuizIdentity(admin, { username, email, anonId }) {
  const uname = cleanName(username);
  const mail = validEmail(email) ? email.trim() : null;
  const anon = cleanAnon(anonId);
  if (!uname) return null;

  let user = null;
  if (mail) {
    const { data } = await admin.from('quiz_users').select('id, username, email').ilike('email', mail).maybeSingle();
    user = data || null;
  }
  if (!user && anon) {
    const { data, error } = await admin.from('quiz_users').select('id, username, email').eq('anon_id', anon).maybeSingle();
    if (!error) user = data || null;
  }

  if (user) {
    if ((user.username || '').trim().toLowerCase() !== uname.toLowerCase() && (await usernameTaken(admin, uname, user.id))) {
      return { error: 'username_taken' };
    }
    const patch = { username: uname };
    if (mail && !user.email) patch.email = mail; // back-fill an email onto a name-only account
    let { data, error } = await admin.from('quiz_users').update(patch).eq('id', user.id).select('id, username, email').single();
    if (error && error.code === '23505') {
      // that email is already taken by another account -> keep just the name change
      ({ data } = await admin.from('quiz_users').update({ username: uname }).eq('id', user.id).select('id, username, email').single());
    }
    return data || { id: user.id, username: uname, email: user.email };
  }

  // New identity (email may be null).
  if (await usernameTaken(admin, uname, null)) {
    return { error: 'username_taken' };
  }
  const insertRow = { username: uname, email: mail, anon_id: anon };
  let ins = await admin.from('quiz_users').insert(insertRow).select('id, username, email').single();
  if (ins.error && ins.error.code === '42703') {
    // anon_id column not present yet (pre-migration 23): insert without it
    const { anon_id, ...noAnon } = insertRow;
    ins = await admin.from('quiz_users').insert(noAnon).select('id, username, email').single();
  }
  let { data, error } = ins;
  if (error) {
    if (error.code === '23505') {
      // race: row created between the select and insert -> fetch and update name
      let q = admin.from('quiz_users').select('id, username, email');
      q = mail ? q.ilike('email', mail) : q.eq('anon_id', anon);
      const { data: d2 } = await q.maybeSingle();
      if (d2) {
        if ((d2.username || '').trim().toLowerCase() !== uname.toLowerCase() && (await usernameTaken(admin, uname, d2.id))) {
          return { error: 'username_taken' };
        }
        const { data: d3 } = await admin.from('quiz_users').update({ username: uname }).eq('id', d2.id).select('id, username, email').single();
        return d3 || d2;
      }
    }
    console.error('resolveQuizIdentity insert error', error);
    return null;
  }
  return data;
}

// Link a browser's earlier anonymous games to the identity (best-effort; no-ops
// until migration 22 adds quiz_results.anon_id).
export async function attributeAnonGames(admin, anonId, user) {
  const anon = cleanAnon(anonId);
  if (!anon || !user || !user.id) return;
  const { error } = await admin
    .from('quiz_results')
    .update({ user_id: user.id, username: user.username })
    .eq('anon_id', anon)
    .is('user_id', null);
  if (error && error.code !== '42703') console.error('attributeAnonGames error', error);
}

// All browser anon_ids that belong to the same account as (anonId or email).
// Always includes the passed anonId. This is what lets a duel follow the ACCOUNT
// across devices instead of being stranded on the single browser that created
// it: a player who challenged from one browser (anon A) can see and play that
// duel from another browser (anon B) once both browsers' games are attributed
// to the same quiz_users id. Resolution order: email -> the current browser's
// attributed games -> quiz_users.anon_id, then every attributed browser anon.
export async function resolveAnonSet(admin, { anonId, email } = {}) {
  const anon = cleanAnon(anonId);
  const set = new Set();
  if (anon) set.add(anon);
  let userId = null;
  try {
    const ident = await findQuizIdentity(admin, { email, anonId: anon });
    if (ident && ident.id) userId = ident.id;
  } catch (e) { /* ignore */ }
  if (!userId && anon) {
    try {
      const { data } = await admin.from('quiz_results').select('user_id').eq('anon_id', anon).not('user_id', 'is', null).limit(1);
      if (Array.isArray(data) && data[0] && data[0].user_id) userId = data[0].user_id;
    } catch (e) { /* pre-migration: user_id/anon_id may be absent */ }
  }
  if (userId) {
    try {
      const { data: u } = await admin.from('quiz_users').select('anon_id').eq('id', userId).maybeSingle();
      if (u && u.anon_id) set.add(u.anon_id);
    } catch (e) { /* ignore */ }
    try {
      const { data: rows } = await admin.from('quiz_results').select('anon_id').eq('user_id', userId).not('anon_id', 'is', null).limit(2000);
      for (const r of (rows || [])) if (r.anon_id) set.add(r.anon_id);
    } catch (e) { /* ignore */ }
  }
  return [...set];
}

// PostgREST OR-filter matching a duel to any of the account's anon_ids on either
// side. anon_ids are UUID-ish; quote each so any stray character stays literal.
export function duelOrFilter(anons) {
  const list = (anons || []).map((a) => `"${String(a).replace(/"/g, '')}"`).join(',');
  return `challenger_anon.in.(${list}),opponent_anon.in.(${list})`;
}
