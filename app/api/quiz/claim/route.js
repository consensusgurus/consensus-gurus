import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function summarize(rows) {
  const plays = rows.length;
  const best = plays ? Math.max(...rows.map((r) => r.score)) : null;
  // Signed-up players only, but EVERY qualifying play is listed (a single
  // player can appear more than once). Top 10 by score desc, then fastest time.
  const leaderboard = rows
    .filter((r) => r.user_id)
    .sort((a, b) => b.score - a.score || a.time_elapsed - b.time_elapsed)
    .slice(0, 10)
    .map((r) => ({ username: r.username, score: r.score, timeElapsed: r.time_elapsed }));
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

    const { data } = await supabaseAdmin
      .from('quiz_results')
      .select('user_id, username, score, time_elapsed')
      .eq('quiz_id', quizId);
    return NextResponse.json({ ...summarize(data || []), username: user.username, email: user.email });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
