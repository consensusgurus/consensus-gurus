import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { resolvePlayerKeys } from '@/lib/quiz-identity';

// POST /api/quiz/daily-start  { quizId, anonId, email? }
//
// "This player has STARTED this daily and has not finished it." One row in
// daily_in_progress (migration 52), which is what makes a paused game visible
// on the player's other devices. See that migration for the full why; the short
// version is that the only cross-device in-progress signal used to be an
// abandoned quiz_results row filed on `pagehide`, and a phone that gets
// backgrounded never fires it.
//
// A row here is a HINT, never a result: no score, no time, no verdict, and it
// touches nothing that scores. Nor is it ever deleted on finish, because
// daily-status supersedes it (any quiz_id the player also has a played /
// completed / abandoned row for is dropped from the reply), so finishing a game
// costs no write at all.
//
// Fired by app/DailyStartPing.jsx the moment a board first writes its
// `sot_<key>_day` breadcrumb with done:false, which every daily client does
// exactly when it stamps t0. Opening a board and leaving therefore pings
// nothing, per the "opening a game is not starting it" rule.

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Daily quizIds look like `<game>-<M>-<D>-<YY>`. Deliberately a SHAPE check
// rather than the roster regex daily-status carries: this route stores a hint
// and reads nothing back, so a retired or brand-new game key must not 400 here
// and force a client edit. Anything that is not a dated daily id is refused.
const DAILY_ID = /^[a-z]{3,12}-\d{1,2}-\d{1,2}-\d{2}$/;

// The table is append-only from the client's point of view, so something has to
// retire old rows. A drop is dead the moment its day is over, and nothing reads
// a row older than today, so a week is generous. Run on roughly one start in
// twenty rather than on every one: it is housekeeping, not correctness, and a
// player pressing Start should not wait on a DELETE.
const SWEEP_ODDS = 0.05;
const SWEEP_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export async function POST(request) {
  try {
    const body = await request.json();
    const quizId = typeof body.quizId === 'string' ? body.quizId.trim().slice(0, 64) : '';
    const anonId = typeof body.anonId === 'string' && body.anonId.trim() ? body.anonId.trim().slice(0, 64) : null;
    const email = typeof body.email === 'string' && body.email.trim() ? body.email.trim() : null;
    if (!DAILY_ID.test(quizId)) return NextResponse.json({ ok: false, reason: 'quizId' }, { status: 400 });

    // The same identity resolution every other daily route uses, so the row is
    // filed under the account when there is one and the player's other browsers
    // find it. A pure guest still gets a row under their anon key, which is
    // right: it survives a reload on that device even if localStorage is wiped.
    const who = await resolvePlayerKeys(supabaseAdmin, { email, anonId });
    if (!who.primary) return NextResponse.json({ ok: false, reason: 'identity' }, { status: 400 });

    const row = {
      quiz_id: quizId,
      player_key: who.primary,
      anon_id: anonId,
      user_id: who.userId || null,
    };
    const { error } = await supabaseAdmin
      .from('daily_in_progress')
      .upsert(row, { onConflict: 'quiz_id,player_key', ignoreDuplicates: true });

    // A missing table (migration not yet applied) must not surface as an error
    // to the player: the ping is an enhancement and the game is unaffected.
    if (error) {
      const missing = error.code === '42P01' || /does not exist|schema cache/i.test(error.message || '');
      if (!missing) console.error('daily-start upsert', error);
      return NextResponse.json({ ok: false, stored: false });
    }

    if (Math.random() < SWEEP_ODDS) {
      try {
        await supabaseAdmin
          .from('daily_in_progress')
          .delete()
          .lt('created_at', new Date(Date.now() - SWEEP_AGE_MS).toISOString());
      } catch (e) { /* housekeeping only */ }
    }
    return NextResponse.json({ ok: true, stored: true });
  } catch (e) {
    console.error('daily-start exception', e);
    return NextResponse.json({ ok: false });
  }
}
