import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Best-effort: attribute EVERY unattributed game this browser played (matched by
// its persistent anon_id, across all quizzes) to the freshly-identified user.
// This is what closes the "warm up anonymously, then claim a great run as 1st
// Try" loophole: the earlier anonymous attempts get linked too, so they count
// toward the per-user attempt number. No-ops cleanly until migration 22 adds the
// anon_id column.
async function attributeAnonGames(admin, anonId, user) {
  if (!anonId || !user) return;
  const { error } = await admin
    .from('quiz_results')
    .update({ user_id: user.id, username: user.username })
    .eq('anon_id', anonId)
    .is('user_id', null);
  if (error && error.code !== '42703') {
    console.error('attribute anon games error', error);
  }
}

function summarize(rows) {
  const plays = rows.length;
  const best = plays ? Math.max(...rows.map((r) => r.score)) : null;
  // Signed-up players only, but EVERY qualifying play is listed (a single
  // player can appear more than once). Top 10 by score desc, then fastest time.
  // Per-user chronological attempt number (1 = that player's first completed
  // game for this quiz), assigned by row id ascending. Lets the UI tag each
  // leaderboard entry "(1st Try)", "(2nd Try)"... so multiple plays from the
  // same person are distinguishable.
  const signed = rows.filter((r) => r.user_id);
  const tryByUser = {};
  const tryOf = new Map();
  signed
    .slice()
    .sort((a, b) => (a.id || 0) - (b.id || 0))
    .forEach((r) => {
      tryByUser[r.user_id] = (tryByUser[r.user_id] || 0) + 1;
      tryOf.set(r, tryByUser[r.user_id]);
    });
  const leaderboard = signed
    .sort((a, b) => b.score - a.score || a.time_elapsed - b.time_elapsed || (a.username || '').localeCompare(b.username || ''))
    .slice(0, 10)
    .map((r) => ({ username: r.username, score: r.score, timeElapsed: r.time_elapsed, tryNum: tryOf.get(r) }));
  return { plays, best, leaderboard };
}

// POST /api/quiz/claim  { quizId, resultId, username, email }
// Retroactively post a just-finished (anonymous) game to the leaderboard:
// upsert the player's identity by email, then attach the EXISTING result row
// to them. Because it attributes the row in place (no new insert), the play is
// never double-counted. Returns the refreshed board plus the caller's identity.
export async function POST(request) {
  try {
    const body = (await request.json()) || {};
    const quizId = typeof body.quizId === 'string' ? body.quizId.trim() : '';
    const resultId = Number.isInteger(body.resultId) ? body.resultId : null;
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const anonId = typeof body.anonId === 'string' && body.anonId.trim() ? body.anonId.trim().slice(0, 64) : null;

    if (!quizId || quizId.length > 100) {
      return NextResponse.json({ error: 'quizId required' }, { status: 400 });
    }
    if (!username || username.length > 40) {
      return NextResponse.json({ error: 'Username required (max 40 characters).' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email) || email.length > 120) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!resultId) {
      return NextResponse.json({ error: 'No game to post. Finish a round first.' }, { status: 400 });
    }

    // Upsert the leaderboard identity by email (mirrors /api/quiz/join).
    let user;
    const { data: existing, error: selErr } = await supabaseAdmin
      .from('quiz_users')
      .select('id, username, email')
      .ilike('email', email)
      .maybeSingle();
    if (selErr) {
      console.error('quiz claim select error', selErr);
      return NextResponse.json({ error: 'Could not post right now.' }, { status: 500 });
    }
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('quiz_users')
        .update({ username })
        .eq('id', existing.id)
        .select('id, username, email')
        .single();
      if (error) {
        console.error('quiz claim update error', error);
        return NextResponse.json({ error: 'Could not post right now.' }, { status: 500 });
      }
      user = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('quiz_users')
        .insert({ username, email })
        .select('id, username, email')
        .single();
      if (error) {
        if (error.code === '23505') {
          const { data: d2 } = await supabaseAdmin
            .from('quiz_users')
            .update({ username })
            .ilike('email', email)
            .select('id, username, email')
            .single();
          user = d2;
        } else {
          console.error('quiz claim insert error', error);
          return NextResponse.json({ error: 'Could not post right now.' }, { status: 500 });
        }
      } else {
        user = data;
      }
    }
    if (!user) {
      return NextResponse.json({ error: 'Could not post right now.' }, { status: 500 });
    }

    // Attach the specific result row to this user, but only if it is still
    // unattributed (so a shared link can't reassign someone else's game).
    const { error: updErr } = await supabaseAdmin
      .from('quiz_results')
      .update({ user_id: user.id, username: user.username })
      .eq('id', resultId)
      .eq('quiz_id', quizId)
      .is('user_id', null);
    if (updErr) {
      console.error('quiz claim attribute error', updErr);
      return NextResponse.json({ error: 'Could not post right now.' }, { status: 500 });
    }

    // Also link every earlier anonymous game from this browser to the user.
    await attributeAnonGames(supabaseAdmin, anonId, user);

    const { data } = await supabaseAdmin
      .from('quiz_results')
      .select('id, user_id, username, score, time_elapsed')
      .eq('quiz_id', quizId);
    return NextResponse.json({ ...summarize(data || []), username: user.username, email: user.email });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
