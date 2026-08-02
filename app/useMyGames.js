'use client';

// The games the signed-in player pinned (owner request, 2026-08-02).
//
// The homepage tile board shows all 43 dailies ordered by total plays TODAY,
// so a regular had to hunt for the handful they play. Pinning promotes a game
// to the front of that board and nothing else changes.
//
// PINS ARE THE ONLY SIGNAL (owner ruling, 2026-08-02). The first version also
// promoted each player's most-played games automatically; the owner cut it, so
// the order is exactly: (1) your stars, (2) total plays on the day. Do not
// reintroduce a derived tier without asking.
//
// A guest gets { canPin:false } and an empty list, which makes sortByMyGames a
// no-op and leaves the board exactly as it shipped.
//
// SSR: returns the empty state on first render (server and first client render
// agree), then fills in from an effect, the same shape as useDailyOrder. So a
// personalized board never causes a hydration mismatch, it just re-sorts a
// moment later.

import { useState, useEffect, useCallback } from 'react';
import { dailyMeIdentity } from './dailyMeClient';

// `favorites` is the live pin state (what the stars show). `orderFavorites` is
// the snapshot the BOARD sorts by, and it deliberately does NOT move when a pin
// is toggled: re-sorting on the click would teleport the tile out from under
// the pointer (and out from under the finger on a phone), so a new pin takes
// effect on the next load. `canPin` is false when the quiz_users.favorites
// column is missing, which hides the control rather than offering a button that
// cannot write.
const EMPTY = { registered: false, canPin: false, favorites: [], orderFavorites: [], max: 12, loaded: false };

// One fetch and one truth per page, shared by every component that asks. The
// board and the expanded tile panel both need this, and a pin toggled in the
// panel has to move the tile behind it, so the state lives here rather than in
// either component.
let shared = EMPTY;
let inflight = null;
const subs = new Set();

function publish(next) {
  shared = next;
  for (const fn of subs) { try { fn(next); } catch (e) {} }
}

function load() {
  if (inflight) return inflight;
  const { anonId, email } = dailyMeIdentity();
  if (!anonId && !email) {
    // No identity in localStorage YET. Do not cache this as the answer: the
    // anon id is written on the first recorded play, and a player who joins the
    // leaderboard mid-session must get their stars without a hard reload.
    publish({ ...EMPTY, loaded: true });
    return Promise.resolve(shared);
  }
  const qs = new URLSearchParams();
  if (anonId) qs.set('anonId', anonId);
  if (email) qs.set('email', email);
  inflight = fetch('/api/quiz/favorites?' + qs.toString(), { cache: 'no-store' })
    .then((r) => r.json())
    .then((d) => {
      const favs = Array.isArray(d && d.favorites) ? d.favorites : [];
      publish({
        registered: !!(d && d.registered),
        canPin: !!(d && d.canPin),
        favorites: favs,
        orderFavorites: favs,
        max: (d && d.max) || 12,
        loaded: true,
      });
      return shared;
    })
    .catch(() => {
      // The board is fully usable in global order, so a failed personalization
      // fetch is silent by design.
      publish({ ...EMPTY, loaded: true });
      return shared;
    })
    .finally(() => { inflight = null; });
  return inflight;
}

export default function useMyGames() {
  const [state, setState] = useState(shared);

  useEffect(() => {
    subs.add(setState);
    setState(shared);
    load();
    return () => { subs.delete(setState); };
  }, []);

  // Optimistic: the star fills and the tile moves on the click, then the
  // server's list replaces ours. A rejected write (guest, cap reached, column
  // not migrated yet) rolls the pin back to whatever the server says it is.
  const toggleFavorite = useCallback((key) => {
    if (!key) return Promise.resolve({ ok: false, error: 'no_key' });
    const before = shared.favorites;
    const on = !before.includes(key);
    const optimistic = on ? [...before.filter((k) => k !== key), key] : before.filter((k) => k !== key);
    // Only `favorites` moves. orderFavorites stays put on purpose (see EMPTY).
    publish({ ...shared, favorites: optimistic });
    const { anonId, email } = dailyMeIdentity();
    return fetch('/api/quiz/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonId, email, key, on }),
    })
      .then((r) => r.json())
      .then((d) => {
        // Settle against the server either way: on a rejection (cap reached,
        // column not migrated, guest) its list is the truth and the star
        // un-fills. Reading off `shared` rather than the captured `before`
        // keeps a second toggle made mid-flight.
        const server = d && Array.isArray(d.favorites) ? d.favorites : before;
        publish({
          ...shared,
          registered: d && d.registered !== undefined ? !!d.registered : shared.registered,
          canPin: d && d.canPin !== undefined ? !!d.canPin : shared.canPin,
          favorites: server,
        });
        return { ok: !!(d && d.ok), error: (d && d.error) || null };
      })
      .catch(() => {
        publish({ ...shared, favorites: before });
        return { ok: false, error: 'network' };
      });
  }, []);

  return { ...state, toggleFavorite };
}

// Promote the player's pinned games to the front of an already-sorted list.
// Everything else keeps the order the caller handed us, which is the board's
// global total-plays-today order. Two tiers only: pinned, then not (owner
// ruling, 2026-08-02, replacing an earlier three-tier version that also
// promoted the player's most-played games).
//
// Stable within each tier, and a complete no-op for a guest or a player with no
// pins: the input array is returned BY REFERENCE, so a signed-out board is
// untouched.
//
// The tiers apply to the WHOLE list; the caller's own grouping (the board splits
// unfinished from finished after this) still wins over them, which is
// intentional: a finished pin should not outrank a game you have not played yet.
export function sortByMyGames(list, favorites, keyOf) {
  const kf = keyOf || ((x) => x.key);
  const favs = Array.isArray(favorites) ? favorites : [];
  if (!Array.isArray(list) || !favs.length) return list;
  const favSet = new Set(favs);
  const idx = new Map(list.map((g, i) => [kf(g), i]));
  return [...list].sort((a, b) => {
    const ka = kf(a);
    const kb = kf(b);
    // Within the pinned tier the caller's order (plays today) decides, so pins
    // are a promotion rather than a hand-ranked list the player has to maintain.
    const ta = favSet.has(ka) ? 0 : 1;
    const tb = favSet.has(kb) ? 0 : 1;
    if (ta !== tb) return ta - tb;
    return idx.get(ka) - idx.get(kb);
  });
}

// The identity changed (a guest just claimed a display name), so the cached
// answer is wrong. Mirrors invalidateDailyMe in app/dailyMeClient.js.
export function invalidateMyGames() {
  inflight = null;
  publish({ ...EMPTY, loaded: false });
}
