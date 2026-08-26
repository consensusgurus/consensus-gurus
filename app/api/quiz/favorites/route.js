import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { isMissingColumn } from '@/lib/quiz-results-cache';
import { findQuizIdentity } from '@/lib/quiz-identity';
import { DAILY_KEYS } from '@/lib/daily-games';

// /api/quiz/favorites -- the games a player pinned (owner, 2026-08-02).
//
// The homepage tile board orders all 43 dailies by total plays TODAY. With that
// many games a regular had to hunt for the handful they play, so a registered
// player can PIN games and those sort to the front. Everything else keeps the
// global play-count order.
//
// Pins are the ONLY personalization (owner ruling, 2026-08-02). An earlier
// version also promoted each player's most-played games, derived from their own
// results; the owner cut it, so the sort is now exactly: (1) your stars,
// (2) total plays on the day. That also took the full quiz_results scan off the
// homepage critical path, so this route is now two small indexed lookups.
//
// REGISTERED ONLY, because the set has to follow the account across devices and
// a guest has no quiz_users row. A guest gets an empty list and the untouched
// global board.
//
// MIGRATION SAFETY: every read and write of the `favorites` column tolerates a
// missing column (42703 / PGRST204) and reports canPin:false, so the UI hides
// the control rather than offering a button that cannot write. Migration 45 is
// applied to prod (2026-08-02), but the guard stays: this is exactly the trap
// 39_outrank_picks sat in.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// THERE IS NO CAP (owner ruling, 2026-08-26). It was 12, set when the board was
// 43 tiles in ONE list and a pin was a promotion inside that list, so a dozen
// pins was the point where promoting more stopped meaning anything. My games is
// its own shelf now and the roster is ~70 games, and the cap had become a trap:
// a player at 12 still saw the star on every tile, the star still filled on the
// click, and the rejection then rolled it back with nothing said. It reads as
// the star mechanism being broken rather than as a limit being reached, which is
// exactly how it was reported. cleanKeys already filters to the live roster and
// de-duplicates, so the stored list can never exceed the roster's own length.
//
// Set this to a number to reintroduce a cap; every consumer reads `max` off the
// response and null means unlimited, so nothing else needs to change. If you do,
// make the CONTROL say so at the cap (disable it and explain, the way the old
// DailyStrip console did) rather than letting a click fail silently.
const FAV_MAX = null;
const KEY_SET = new Set(DAILY_KEYS);

function identOf(searchParams) {
  return {
    anonId: (searchParams.get('anonId') || '').trim() || null,
    email: (searchParams.get('email') || '').trim() || null,
  };
}

// Keep only keys still on the roster, de-duplicated, and capped when a cap
// exists. A game retired after a player pinned it simply drops out here.
function cleanKeys(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const k of arr) {
    const key = typeof k === 'string' ? k.trim() : '';
    if (KEY_SET.has(key) && !out.includes(key)) out.push(key);
    if (FAV_MAX && out.length >= FAV_MAX) break;
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

const EMPTY = { registered: false, canPin: false, favorites: [], max: FAV_MAX };

// GET /api/quiz/favorites?anonId=&email=
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const { anonId, email } = identOf(searchParams);
  if (!anonId && !email) return NextResponse.json(EMPTY);
  try {
    const ident = await findQuizIdentity(supabaseAdmin, { email, anonId });
    if (!ident || !ident.id) return NextResponse.json(EMPTY);
    const { favorites, available } = await readFavorites(ident.id);
    return NextResponse.json({
      registered: true,
      canPin: available,
      username: ident.username || null,
      favorites,
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
    if (FAV_MAX && on && !current.includes(key) && current.length >= FAV_MAX) {
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
