import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

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

// POST /api/quiz/join  { username, email } -> upsert identity by email.
// Open join, no verification. Done with the service-role client (one row per
// email via case-insensitive match), so it bypasses RLS and needs no RPC.
// Returns only the caller's own username/email.
export async function POST(request) {
  try {
    const reqBody = (await request.json()) || {};
    const { username, email } = reqBody;
    const anonId = typeof reqBody.anonId === 'string' && reqBody.anonId.trim() ? reqBody.anonId.trim().slice(0, 64) : null;
    if (typeof username !== 'string' || !username.trim() || username.trim().length > 40) {
      return NextResponse.json({ error: 'Username required (max 40 characters).' }, { status: 400 });
    }
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.trim().length > 120) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    const uname = username.trim();
    const mail = email.trim();

    const { data: existing, error: selErr } = await supabaseAdmin
      .from('quiz_users')
      .select('id, username, email')
      .ilike('email', mail)
      .maybeSingle();
    if (selErr) {
      console.error('quiz join select error', selErr);
      return NextResponse.json({ error: 'Could not join right now.' }, { status: 500 });
    }

    let row;
    if (existing) {
      const { data, error } = await supabaseAdmin
        .from('quiz_users')
        .update({ username: uname })
        .eq('id', existing.id)
        .select('id, username, email')
        .single();
      if (error) {
        console.error('quiz join update error', error);
        return NextResponse.json({ error: 'Could not join right now.' }, { status: 500 });
      }
      row = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('quiz_users')
        .insert({ username: uname, email: mail })
        .select('id, username, email')
        .single();
      if (error) {
        if (error.code === '23505') {
          const { data: d2 } = await supabaseAdmin
            .from('quiz_users')
            .update({ username: uname })
            .ilike('email', mail)
            .select('id, username, email')
            .single();
          row = d2;
        } else {
          console.error('quiz join insert error', error);
          return NextResponse.json({ error: 'Could not join right now.' }, { status: 500 });
        }
      } else {
        row = data;
      }
    }
    // Link any earlier anonymous games from this browser to the new identity so
    // they immediately count on the leaderboard with the correct attempt number.
    await attributeAnonGames(supabaseAdmin, anonId, { id: row?.id || existing?.id, username: row?.username });

    return NextResponse.json({ username: row?.username, email: row?.email });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
