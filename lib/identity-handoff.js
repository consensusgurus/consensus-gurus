// Carrying an anonymous player's identity across the domain move.
//
// THE PROBLEM. Streaks, IQ totals and play history live on the SERVER, keyed by
// quiz_results.anon_id. The browser holds only the key: a token in localStorage
// 'sot_quiz_anon', mirrored into a first-party 'sot_vid' cookie. Browsers refuse to share
// either across origins, so a player arriving at the new domain looks brand new even though
// all of their history is sitting on the server, intact.
//
// THE SHAPE. Not a data migration; no rows change. It moves ONE short string:
//   1. The old domain still has the sot_vid COOKIE, which (unlike localStorage) the server
//      can read. middleware.js signs {id, exp} into the redirect as ?_ml=...
//   2. The new domain posts that token to /api/identity/claim, which verifies it.
//   3. The client adopts it only if its own id is brand new (adoptable() in visitor.js),
//      then strips the parameter from the URL.
//
// WHY IT IS SIGNED. A bare anon_id in a query string is a claim to BE that player, so a
// copied or shared link would hand someone else's history over. Signature plus a short
// expiry means a token is only good for the redirect that created it.
//
// WHY WEB CRYPTO AND NOT node:crypto. The minting side runs in middleware, which is Edge
// runtime, where node:crypto does not exist. crypto.subtle is available in BOTH Edge and
// Node 18+, so one implementation serves both sides. It is async, hence the promises.
//
// Requires IDENTITY_HANDOFF_SECRET. With no secret set, minting and verification both
// refuse, so the handoff is inert rather than insecure.

const TTL_MS = 5 * 60 * 1000;   // a redirect is instant; five minutes is already generous
export const PARAM = '_ml';

const enc = new TextEncoder();
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64url = (s) => {
  const p = s.replace(/-/g, '+').replace(/_/g, '/');
  return atob(p + '='.repeat((4 - (p.length % 4)) % 4));
};

async function key(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' },
                                 false, ['sign', 'verify']);
}

/** Mint a handoff token for an anon id. Resolves null when no secret is configured. */
export async function mintHandoff(anonId, secret = process.env.IDENTITY_HANDOFF_SECRET) {
  if (!secret || !anonId || typeof anonId !== 'string' || !/^[\w-]{1,64}$/.test(anonId)) return null;
  const payload = `${b64url(enc.encode(anonId))}.${Date.now() + TTL_MS}`;
  const mac = await crypto.subtle.sign('HMAC', await key(secret), enc.encode(payload));
  return `${payload}.${b64url(mac)}`;
}

/** Verify a handoff token. Resolves the anon id, or null for anything not currently valid. */
export async function verifyHandoff(token, secret = process.env.IDENTITY_HANDOFF_SECRET) {
  if (!secret || typeof token !== 'string' || token.length > 400) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [idB64, expStr, mac] = parts;
  let sig;
  try { sig = Uint8Array.from(unb64url(mac), (c) => c.charCodeAt(0)); } catch { return null; }
  // subtle.verify is constant-time, so no separate timing-safe compare is needed
  const ok = await crypto.subtle.verify('HMAC', await key(secret), sig, enc.encode(`${idB64}.${expStr}`));
  if (!ok) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  let id;
  try { id = unb64url(idB64); } catch { return null; }
  return /^[\w-]{1,64}$/.test(id) ? id : null;
}
