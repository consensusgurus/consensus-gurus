// Read-only player-location aggregate behind the admin Player Map tab.
// GET /api/admin/geo-map
//
// Auth: the admin cookie OR an "x-admin-token" header matching ADMIN_TASK_TOKEN
// (same pattern as /api/admin/summary). Returns the same payload the admin page
// computes server-side — users by location, games played by location, totals —
// over the FULL history of located plays, plus an `unresolved` list (city
// strings that fell back to a region/country pin) for coverage QA. Mutates
// nothing.

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';
import { buildGeoMapData } from '@/lib/geo-locate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function tokenOk(request) {
  const expected = process.env.ADMIN_TASK_TOKEN;
  if (!expected) return false;
  return request.headers.get('x-admin-token') === expected;
}

// The geo columns arrived in migrations 26 (country/region) and 27 (city); read
// the richest set and fall back so a not-yet-migrated DB degrades gracefully.
async function fetchGeoRows() {
  const order = [['created_at', false], 'id'];
  const colSets = [
    'id, user_id, anon_id, created_at, country, region, city',
    'id, user_id, anon_id, created_at, country, region',
    'id, user_id, anon_id, created_at',
  ];
  let last = null;
  for (const cols of colSets) {
    last = await fetchAllRows(supabaseAdmin, 'quiz_results', cols, order);
    if (!last.error) return last;
    const code = last.error.code;
    const missing = code === '42703' || code === 'PGRST204' || /column|schema cache/i.test(last.error.message || '');
    if (!missing) return last;
  }
  return last;
}

export async function GET(request) {
  if (!isAdmin() && !tokenOk(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const res = await fetchGeoRows();
    if (res.error) {
      console.error('admin geo-map fetch error', res.error);
      return NextResponse.json({ error: 'failed to read plays' }, { status: 500 });
    }
    const data = buildGeoMapData(res.data || []);
    return NextResponse.json(
      { generatedAt: new Date().toISOString(), ...data },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('admin geo-map error', err);
    return NextResponse.json({ error: 'failed to build geo map' }, { status: 500 });
  }
}
