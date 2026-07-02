import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Auth: the admin cookie (the /admin panel) OR an "x-admin-token" header
// matching ADMIN_TASK_TOKEN. Mirrors /api/admin/quiz-reset.
function tokenOk(request) {
  const expected = process.env.ADMIN_TASK_TOKEN;
  if (!expected) return false;
  return request.headers.get('x-admin-token') === expected;
}

// POST /api/admin/quiz-user-rename  { oldName, newName }
// Renames a quiz player's display name across BOTH quiz_users (the canonical
// identity, so future games keep the new name) and quiz_results (the
// leaderboard reads the name off the player's most recent result row). Used to
// clean up names that slipped in before the email-name guard, e.g. a pasted
// email address.
export async function POST(request) {
  if (!isAdmin() && !tokenOk(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const body = (await request.json()) || {};
    const oldName = typeof body.oldName === 'string' ? body.oldName.trim() : '';
    const newName = typeof body.newName === 'string' ? body.newName.trim() : '';

    if (!oldName || oldName.length > 120) {
      return NextResponse.json({ error: 'oldName required' }, { status: 400 });
    }
    if (!newName || newName.length > 40) {
      return NextResponse.json({ error: 'newName required (max 40 characters).' }, { status: 400 });
    }
    if (newName.includes('@')) {
      return NextResponse.json({ error: 'newName cannot be an email address.' }, { status: 400 });
    }
    if (oldName === newName) {
      return NextResponse.json({ ok: true, noop: true });
    }

    // Resolve the matching identity rows (there is normally exactly one).
    const { data: matched, error: selErr } = await supabaseAdmin
      .from('quiz_users')
      .select('id')
      .eq('username', oldName);
    if (selErr) {
      console.error('quiz-user-rename select error', selErr);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    const ids = (matched || []).map((r) => r.id);

    let usersRenamed = 0;
    let resultsRenamed = 0;

    if (ids.length) {
      const { data: u, error: uErr } = await supabaseAdmin
        .from('quiz_users')
        .update({ username: newName })
        .in('id', ids)
        .select('id');
      if (uErr) {
        console.error('quiz-user-rename users update error', uErr);
        return NextResponse.json({ error: 'db error' }, { status: 500 });
      }
      usersRenamed = (u || []).length;

      const { data: r, error: rErr } = await supabaseAdmin
        .from('quiz_results')
        .update({ username: newName })
        .in('user_id', ids)
        .select('id');
      if (rErr) {
        console.error('quiz-user-rename results-by-user update error', rErr);
        return NextResponse.json({ error: 'db error' }, { status: 500 });
      }
      resultsRenamed = (r || []).length;
    }

    // Also sweep any result rows still carrying the old display name (covers
    // anonymous-then-attributed rows whose username was stamped before the
    // identity was linked).
    const { data: r2, error: r2Err } = await supabaseAdmin
      .from('quiz_results')
      .update({ username: newName })
      .eq('username', oldName)
      .select('id');
    if (r2Err) {
      console.error('quiz-user-rename results-by-name update error', r2Err);
      return NextResponse.json({ error: 'db error' }, { status: 500 });
    }
    resultsRenamed += (r2 || []).length;

    return NextResponse.json({ ok: true, usersRenamed, resultsRenamed });
  } catch (e) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
