// Carrying an anonymous player's identity across the domain move.
//
// THE PROBLEM. Streaks, IQ totals and play history live on the SERVER, keyed by
// quiz_results.anon_id. The browser holds only the key: a token in localStorage
// 'sot_quiz_anon', mirrored into a first-party 'sot_vid' cookie. Browsers refuse to share
// either across origins, so a player arriving at the new domain looks brand new even though
// all of their history is sitting on the server, intact.
//
// THE SHAPE. This is not a data migration; no rows change. It moves ONE short string:
//   1. The old domain still has the sot_vid COOKIE, which (unlike localStorage) the server
//      can read. At redirect time it signs {id, exp} and appends it as ?_ml=...
//   2. The new domain posts that token to /api/identity/claim, which verifies the signature
//      and returns the id.
//   3. The client adopts it only if its own id is brand new (see adoptable() in visitor.js),
//      then strips the parameter from the URL.
//
// WHY IT IS SIGNED. A bare anon_id in a query string is a claim to BE that player, so a
// copied or shared link would hand someone else's history over. The signature plus a short
// expiry means a token is only good for the redirect that created it.
//
// Requires IDENTITY_HANDOFF_SECRET in the environment. With no secret set, minting and
// verification both refuse, so the handoff is simply inert rather than insecure.

import { createHmac, timingSafeEqual } from 'node:crypto';

const TTL_MS = 5 * 60 * 1000;   // a redirect is instant; five minutes is already generous
export const PARAM = '_ml';

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Mint a handoff token for an anon id. Returns null when no secret is configured. */
export function mintHandoff(anonId, secret = process.env.IDENTITY_HANDOFF_SECRET) {
  if (!secret || !anonId || typeof anonId !== 'string' || anonId.length > 64) return null;
  const payload = `${Buffer.from(anonId).toString('base64url')}.${Date.now() + TTL_MS}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** Verify a handoff token. Returns the anon id, or null for anything not currently valid. */
export function verifyHandoff(token, secret = process.env.IDENTITY_HANDOFF_SECRET) {
  if (!secret || typeof token !== 'string' || token.length > 400) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [idB64, expStr, mac] = parts;
  const expected = sign(`${idB64}.${expStr}`, secret);
  // constant-time: a length mismatch alone would otherwise leak via early return
  const a = Buffer.from(mac), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return null;
  const id = Buffer.from(idB64, 'base64url').toString('utf8');
  return /^[\w-]{1,64}$/.test(id) ? id : null;
}
