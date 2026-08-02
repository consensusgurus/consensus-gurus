import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { loadQuizResultsCached, isMissingColumn } from '@/lib/quiz-results-cache';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { DAILY_KEYS, DAILY_DATED_RE } from '@/lib/daily-games';

// /api/quiz/favorites -- the player's own daily-game order (owner, 2026-08-02).
//
// Two answers in one payload, because the homepage board needs both on first
// paint and they resolve from the same identity lookup:
//
//   favorites  - games the player PINNED, in pin order. Explicit, registered
//                players only, stored in quiz_users.favorites (migration 45).
//   mostPlayed - games the player actually plays, derived, no writes and no
//                setup. This is what makes the feature work for the regular who
//                never touches the pin control.
//
// DailyStrip sorts favorites first, then mostPlayed, then the global order, so
// a signed-out visitor (registered:false, both arrays empty) sees exactly the
// board that shipped before this route existed.
//
// REGISTERED ONLY is an owner ruling, not an implementation limit: the set has
// to follow the account across devices, so it hangs off quiz_users, and a guest
// has no row there. An anonymous browser keeps the global order.
//
// MIGRATION SAFETY: every read and write of the `favorites` column tolerates a
// missing column (42703 / PGRST204) and degrades to "no favorites", the same
// pattern lib/quiz-identity.js uses for anon_id. So this deploys safely BEFORE
// migration 45 is applied to prod, which matters because a migration has been
// left unapplied before (39_outrank_picks).

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// A board of 43 tiles stops being personalized somewhere around a dozen pins,
// so the cap is a usability guard, not a storage one.
const FAV_MAX = 12;
// Recency window for mostPlayed. Long enough to survive a week off, short
// enough that the order tracks what the player likes NOW rather than the game
// they binged last winter.
const RECENT_DAYS = 90;
// How many games mostPlayed promotes. Past this the global order is a better
// signal than a player's long tail of one-off tries.
const MOST_PLAYED_N = 8;

const KEY_SET = new Set(DAILY_KEYS);
const CANON = new Map(DAILY_KEYS.map((k, i) => [k, i]));

function identOf(searchParams) {
  return {
    anonId: (searchParams.get('anonId') || '').trim() || null,
    email: (searchParams.get('email') || '').trim() || null,
  };
}

// Keep only keys still on the roster, de-duplicated, capped. A game retired
// after a player pinned it simply drops out here.
function cleanKeys(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const k of arr) {
    const key = typeof k === 'string' ? k.trim() : '';
    if (KEY_SET.has(key) && !out.includes(key)) out.push(key);
    if (out.length >= FAV_MAX) break;
  }
  return out;
}

// Returns { favorites, available }. `available` is FALSE when the column does
// not exist yet, which is the state prod is in until migration 45 is applied.
// The distinction matters: without it a registered player is shown a pin
// control that silently does nothing (fills, POSTs, rolls back), which is
// exactly the trap migration 39 (outrank_picks) sat in for weeks. GET passes
// this through as `canPin` and the board hides the star entirely.
async function readFavorites(userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('quiz_users').select('favorites').eq('id', userId).maybeSingle();
    if (error) {
      if (isMissingColumn(error)) return { favorites: [], available: false };
      console.error('favorites read error', error);
      return { favorites: [], available: true };
    }
    return { favorites: cleanKeys(data && data.favorites), available: true };
  } catch (e) {
    return { favorites: [], available: false };
  }
}

// The player's OWN daily plays, counted per game.
//
// A row is theirs when it carries their user_id (every play since they
// registered, on any device, plus everything attributeAnonGames back-filled) or
// this browser's anon_id (plays from before they registered, on this device).
// That covers the same ground as resolveAnonSet without its extra round trips,
// which matters on a route the homepage calls on every load.
//
// Falls back to all-time when the recent window is empty, so a player returning
// after a long break still gets their own order on the first morning back
// rather than a cold global board.
function mostPlayedFor(rows, { userId, anonId }) {
  const cutoff = Date.now() - RECENT_DAYS * 86400000;
  const recent = new Map();
  const all = new Map();
  for (const r of rows) {
    if (!r) continue;
    const mine = (userId && r.user_id === userId) || (anonId && r.anon_id === anonId);
    if (!mine) continue;
    const m = DAILY_DATED_RE.exec(r.quiz_id || '');
    if (!m) continue;
    const key = m[1];
    all.set(key, (all.get(key) || 0) + 1);
    const t = r.created_at ? Date.parse(r.created_at) : NaN;
    if (!Number.isNaN(t) && t >= cutoff) recent.set(key, (recent.get(key) || 0) + 1);
  }
  const src = recent.size ? recent : all;
  return [...src.entries()]
    .sort((a, b) => (b[1] - a[1])
      || ((CANON.has(a[0]) ? CANON.get(a[0]) : 99) - (CANON.has(b[0]) ? CANON.get(b[0]) : 99)))
    .slice(0, MOST_PLAYED_N)
    .map(([key, plays]) => ({ key, plays }));
}

const EMPTY = { registered: false, canPin: false, favorites: [], mostPlayed: [], max: FAV_MAX };

// GET /api/quiz/favorites?anonId=&email=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const { anonId, email } = identOf(searchParams);
  if (!anonId && !email) return NextResponse.json(EMPTY);
  try {
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (!ident || !ident.id) return NextResponse.json(EMPTY);
    const { favorites, available } = await readFavorites(ident.id);
    let mostPlayed = [];
    try {
      const { data, error } = await loadQuizResultsCached(supabaseAdmin);
      if (!error && Array.isArray(data)) {
        mostPlayed = mostPlayedFor(data, { userId: ident.id, anonId });
      }
    } catch (e) {
      // A cold results cache must never cost the player their pins.
      console.error('favorites mostPlayed error', e);
    }
    return NextResponse.json({
      registered: true,
      canPin: available,
      username: ident.username || null,
      favorites,
      mostPlayed,
      max: FAV_MAX,
    });
  } catch (e) {
    console.error('favorites GET exception', e);
    return NextResponse.json(EMPTY);
  }
}

// POST /api/quiz/favorites  { anonId, email, key, on }
// Pins (on !== false) or unpins one game. Returns the full new list so the
// client can settle its optimistic update against the server's truth.
export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch (e) { body = {}; }
  const anonId = (typeof body.anonId === 'string' && body.anonId.trim()) || null;
  const email = (typeof body.email === 'string' && body.email.trim()) || null;
  const key = typeof body.key === 'string' ? body.key.trim() : '';
  const on = body.on !== false;

  if (!KEY_SET.has(key)) {
    return NextResponse.json({ ok: false, error: 'unknown_game' }, { status: 400 });
  }
  try {
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    // Not an error: a guest has nowhere to store this. The client uses it to
    // prompt for a display name rather than to show a failure.
    if (!ident || !ident.id) {
      return NextResponse.json({ ok: false, error: 'not_registered', registered: false, canPin: false, favorites: [] });
    }
    const { favorites: current, available } = await readFavorites(ident.id);
    if (!available) {
      return NextResponse.json({ ok: false, error: 'no_column', registered: true, canPin: false, favorites: [] });
    }
    const without = current.filter((k) => k !== key);
    if (on && !current.includes(key) && current.length >= FAV_MAX) {
      return NextResponse.json({ ok: false, error: 'limit', registered: true, canPin: true, favorites: current, max: FAV_MAX });
    }
    const next = on ? [...without, key] : without;
    const { error } = await supabaseAdmin.from('quiz_users').update({ favorites: next }).eq('id', ident.id);
    if (error) {
      const missing = isMissingColumn(error);
      if (!missing) console.error('favorites write error', error);
      return NextResponse.json({
        ok: false,
        error: missing ? 'no_column' : 'write_failed',
        registered: true,
        canPin: !missing,
        favorites: current,
      });
    }
    return NextResponse.json({ ok: true, registered: true, canPin: true, favorites: next, max: FAV_MAX });
  } catch (e) {
    console.error('favorites POST exception', e);
    return NextResponse.json({ ok: false, error: 'exception' }, { status: 500 });
  }
}
