import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { resolvePlayerKeys } from '@/lib/quiz-identity';

// /api/quiz/daily-save - the in-progress BOARD, across devices.
//
// Migration 52 made the in-progress MARKER travel; this carries the board that
// goes with it, so "in progress" on a second device can actually be resumed
// instead of opening blank. See supabase/migrations/53_daily_saves.sql for the
// full why. `state` is the exact localStorage string, opaque here on purpose:
// all 58 daily clients own their own save shape, so nothing server-side may
// depend on the contents.
//
// POST { storeKey, gameKey, ymd, state, anonId, email? }  - upsert one board.
// GET  ?game=<key>&ymd=<YYYY-MM-DD>&anonId=&email=        - my open board, if any.
//
// Neither verb touches anything that scores. A missing table (migration not yet
// applied) is reported as `stored:false` / `save:null`, never as an error: the
// feature is an enhancement and the game must play identically without it.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// `sot_<game>_<num>`, optionally Crux's `_r<rev>` namespace suffix. A shape
// check rather than a roster check, deliberately, and for the same reason
// daily-start uses one: a brand-new or retired game key must never 400 here and
// force a client edit.
const STORE_KEY = /^sot_([a-z]{3,12})_(\d{1,7})(?:_r\d{1,3})?$/;
const YMD = /^\d{4}-\d{2}-\d{2}$/;

// Comfortably above the fattest real save. Crux is the biggest at roughly 2-5KB
// (it keeps a full per-slot guess history); everything else is under 2KB. A
// blob past this is a bug or an abuse, not a board, and is refused rather than
// stored.
const MAX_BYTES = 64 * 1024;

// A board is dead once its day is over: nothing reads a row whose ymd is not
// today. A week is generous. Swept on roughly one write in fifty rather than
// every one, because saves are written far more often than starts are, and this
// is housekeeping rather than correctness.
const SWEEP_ODDS = 0.02;
const SWEEP_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request) {
  try {
    const body = await request.json();
    const storeKey = typeof body.storeKey === 'string' ? body.storeKey.trim().slice(0, 96) : '';
    const ymd = typeof body.ymd === 'string' ? body.ymd.trim() : '';
    const state = typeof body.state === 'string' ? body.state : '';
    const anonId = typeof body.anonId === 'string' && body.anonId.trim() ? body.anonId.trim().slice(0, 64) : null;
    const email = typeof body.email === 'string' && body.email.trim() ? body.email.trim() : null;

    const m = STORE_KEY.exec(storeKey);
    if (!m) return NextResponse.json({ ok: false, reason: 'storeKey' }, { status: 400 });
    if (!YMD.test(ymd)) return NextResponse.json({ ok: false, reason: 'ymd' }, { status: 400 });

    // done:true is the FINISHING write. The board is retired rather than
    // stored, because a completed game must never be offered back on another
    // device as something to resume. The player already has a real result row,
    // and daily-status marks the day done from that.
    if (body.done === true) {
      const fin = await resolvePlayerKeys(supabaseAdmin, { email, anonId });
      if (!fin.primary) return NextResponse.json({ ok: false, reason: 'identity' }, { status: 400 });
      try {
        await supabaseAdmin
          .from('daily_saves')
          .delete()
          .eq('store_key', storeKey)
          .in('player_key', [...(fin.keys || [fin.primary])]);
      } catch (e) { /* a stale row is swept within the week either way */ }
      return NextResponse.json({ ok: true, retired: true });
    }

    if (!state) return NextResponse.json({ ok: false, reason: 'state' }, { status: 400 });
    if (state.length > MAX_BYTES) return NextResponse.json({ ok: false, reason: 'size' }, { status: 413 });

    const who = await resolvePlayerKeys(supabaseAdmin, { email, anonId });
    if (!who.primary) return NextResponse.json({ ok: false, reason: 'identity' }, { status: 400 });

    const row = {
      store_key: storeKey,
      game_key: m[1],
      ymd,
      player_key: who.primary,
      anon_id: anonId,
      user_id: who.userId || null,
      state,
      bytes: state.length,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin
      .from('daily_saves')
      .upsert(row, { onConflict: 'store_key,player_key' });

    if (error) {
      const missing = error.code === '42P01' || /does not exist|schema cache/i.test(error.message || '');
      if (!missing) console.error('daily-save upsert', error);
      return NextResponse.json({ ok: false, stored: false });
    }

    if (Math.random() < SWEEP_ODDS) {
      try {
        await supabaseAdmin
          .from('daily_saves')
          .delete()
          .lt('updated_at', new Date(Date.now() - SWEEP_AGE_MS).toISOString());
      } catch (e) { /* housekeeping only */ }
    }
    return NextResponse.json({ ok: true, stored: true });
  } catch (e) {
    console.error('daily-save exception', e);
    return NextResponse.json({ ok: false });
  }
}

export async function GET(request) {
  const none = { ok: true, save: null };
  try {
    const { searchParams } = new URL(request.url);
    const game = (searchParams.get('game') || '').trim();
    const ymd = (searchParams.get('ymd') || '').trim();
    const anonId = (searchParams.get('anonId') || '').trim() || null;
    const email = (searchParams.get('email') || '').trim() || null;
    if (!/^[a-z]{3,12}$/.test(game) || !YMD.test(ymd)) return NextResponse.json(none);

    // EVERY key this account is filed under, not just the primary: a board
    // saved on a device that was signed out, and only later claimed, is filed
    // under that browser's anon key. Matching one key is the exact bug that hid
    // a game played on one device from every other one.
    const who = await resolvePlayerKeys(supabaseAdmin, { email, anonId });
    const keys = [...(who.keys || [])];
    if (!keys.length) return NextResponse.json(none);

    const { data, error } = await supabaseAdmin
      .from('daily_saves')
      .select('store_key, state, updated_at')
      .eq('game_key', game)
      .eq('ymd', ymd)
      .in('player_key', keys)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) {
      const missing = error.code === '42P01' || /does not exist|schema cache/i.test(error.message || '');
      if (!missing) console.error('daily-save select', error);
      return NextResponse.json(none);
    }
    const row = data && data[0];
    if (!row) return NextResponse.json(none);
    return NextResponse.json({
      ok: true,
      save: { storeKey: row.store_key, state: row.state, updatedAt: row.updated_at },
    });
  } catch (e) {
    console.error('daily-save GET exception', e);
    return NextResponse.json(none);
  }
}
