// One player's completed games, on demand (2026-08-28).
//
// WHY: the admin page used to embed every player's whole play history in its
// own HTML so that expanding a row had the detail ready. Measured on the live
// site 2026-08-28 that was 72,254 play objects and roughly 34MB of a 35.7MB
// response, to serve rows the admin opens one at a time. The collapsed tables
// only ever render each player's precomputed summary, which is small and still
// ships with the page; the per-play detail now comes from here when a row is
// actually opened.
//
// Auth: the admin cookie, same as the rest of /api/admin. This returns raw
// per-play traffic metadata (referrer, city, user agent), so there is no
// x-admin-token path here: unlike /api/admin/alerts and /api/admin/summary this
// is not something the Cowork research task needs, and a shared token is the
// wrong key for personal data.

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';
import { buildAnonPlayers } from '@/lib/quiz-anon';
import { buildQuizTitles } from '@/lib/admin-quiz-titles';
import { playerKey, playRow, sortPlaysNewestFirst } from '@/lib/admin-plays';
import { loadAdminResultsCached, ADMIN_RESULT_COL_TIERS, isMissingColumn } from '@/lib/admin-results-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// A player's own rows, straight from the database rather than the cache. One
// player is tens of rows on an indexed equality filter, so this answers in
// milliseconds and does not depend on the cache being warm in THIS lambda,
// which matters because the expand happens well after the page render and may
// well land on a different instance.
async function fetchPlayerRows(key) {
  const filter =
    key.startsWith('u:') ? (q) => q.eq('user_id', key.slice(2))
    // Anonymous grouping excludes any row that also carries a user_id, matching
    // how the page (and buildAnonPlayers) bucket anonymous browsers.
    : key.startsWith('a:') ? (q) => q.eq('anon_id', key.slice(2)).is('user_id', null)
    : (q) => q.eq('id', key.slice(2));

  // Same column-tier fallback the cache runs, so a database that predates
  // migration 26 or 27 degrades here identically instead of erroring.
  let last = null;
  for (const cols of ADMIN_RESULT_COL_TIERS) {
    last = await fetchAllRows(supabaseAdmin, 'quiz_results', cols, ['id'], filter);
    if (!last.error) return last;
    if (!isMissingColumn(last.error)) return last; // a real error, surface it
  }
  return last;
}

export async function GET(request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  const all = searchParams.get('all') === '1';

  try {
    const titles = buildQuizTitles();
    const titleOf = (id) => titles.get(id) || id;

    // Bulk variant, for the "Games detail" CSV export only. This is the whole
    // table again and is deliberately behind an explicit click rather than in
    // every page load. It reads the cache, so on a warm instance it costs one
    // count query and a delta.
    if (all) {
      const res = await loadAdminResultsCached(supabaseAdmin);
      if (res.error) throw res.error;
      const rows = res.data || [];

      const usersRes = await fetchAllRows(
        supabaseAdmin, 'quiz_users', 'id, username, email', ['id'],
      );
      const nameById = new Map();
      const emailById = new Map();
      for (const u of usersRes.data || []) {
        nameById.set(u.id, u.username);
        emailById.set(u.id, u.email);
      }
      // Anonymous display labels come from the same builder the page uses, so
      // an exported guest handle matches the one on screen.
      const labelByKey = new Map(buildAnonPlayers(rows).map((p) => [p.key, p.label]));

      const byKey = new Map();
      for (const r of rows) {
        const k = playerKey(r);
        let g = byKey.get(k);
        if (!g) {
          g = {
            key: k,
            type: r.user_id ? 'Registered' : 'Anonymous',
            name: r.user_id
              ? (nameById.get(r.user_id) || '(no name)')
              : (labelByKey.get(k) || 'Guest'),
            email: r.user_id ? (emailById.get(r.user_id) || '') : '',
            plays: [],
          };
          byKey.set(k, g);
        }
        g.plays.push(playRow(r, titleOf(r.quiz_id)));
      }
      for (const g of byKey.values()) sortPlaysNewestFirst(g.plays);
      return NextResponse.json({ players: Array.from(byKey.values()) });
    }

    if (!key || !/^[uar]:.+/.test(key)) {
      return NextResponse.json({ error: 'missing or malformed key' }, { status: 400 });
    }

    const res = await fetchPlayerRows(key);
    if (res.error) throw res.error;
    const plays = sortPlaysNewestFirst(
      (res.data || []).map((r) => playRow(r, titleOf(r.quiz_id)))
    );
    return NextResponse.json({ key, plays });
  } catch (err) {
    console.error('admin player-plays error', err);
    return NextResponse.json({ error: 'failed to load plays' }, { status: 500 });
  }
}
