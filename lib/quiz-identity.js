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

// Find-or-create the identity. Returns { id, username, email } or null.
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
