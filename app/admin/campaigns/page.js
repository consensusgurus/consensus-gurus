import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Campaigns | Source of Truths',
  robots: { index: false, follow: false },
};

// Same admin palette as AdminClient.
const C = {
  cream: '#f7f8fa',
  paper: '#ffffff',
  ink: '#1c1e24',
  faded: '#6b7280',
  ember: '#0e1d40',
  forest: '#10b981',
  line: 'rgba(20,22,28,0.09)',
};
const SANS = "'Manrope', system-ui, -apple-system, sans-serif";

function fmtDate(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch { return iso; }
}
// Calendar day in US Eastern, the clock the rest of the admin uses.
const ET_DAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
function etDay(iso) {
  if (!iso) return 'unknown';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? 'unknown' : ET_DAY.format(d);
}
function pct(n, d) {
  if (!d) return '—';
  return `${Math.round((n / d) * 100)}%`;
}

// Roll every campaign_hits row and every campaign-stamped quiz_results row into
// one funnel per campaign: scans -> distinct people -> players -> finishers.
//
// "Scans" counts distinct (browser, Eastern day) pairs rather than raw rows, so a
// curious scanner refreshing the page five times counts once that day but still
// counts again if they come back tomorrow. (This de-duplication lives here rather
// than in a unique index because Postgres index expressions must be IMMUTABLE and
// timestamptz-to-calendar-day is only STABLE — see migration 40.) "Landings" is
// the raw row count. "People" is distinct browsers, the honest reach number.
// "Players" is distinct browsers that went on to finish a game while carrying the
// campaign cookie — the number that says whether the ad found the right person.
function rollup(hits, plays) {
  const byCampaign = new Map();
  const get = (c) => {
    if (!byCampaign.has(c)) {
      byCampaign.set(c, {
        campaign: c, landings: 0, botScans: 0, scanKeys: new Set(), people: new Set(), mobile: 0,
        places: new Map(), first: null, last: null,
        plays: 0, players: new Set(), games: new Map(),
      });
    }
    return byCampaign.get(c);
  };
  for (const h of hits || []) {
    if (!h.campaign) continue;
    const r = get(h.campaign);
    if (h.is_bot) { r.botScans += 1; continue; }
    r.landings += 1;
    // One scan per browser per Eastern day. A landing with no visitor cookie
    // can't be deduped, so it counts on its own row id.
    r.scanKeys.add(`${h.visitor_id || `row:${h.id}`}|${etDay(h.created_at)}`);
    if (h.visitor_id) r.people.add(h.visitor_id);
    if (h.is_mobile === true) r.mobile += 1;
    const place = [h.city, h.region, h.country].filter(Boolean).join(', ');
    if (place) r.places.set(place, (r.places.get(place) || 0) + 1);
    const t = h.created_at || '';
    if (t && (!r.first || t < r.first)) r.first = t;
    if (t && (!r.last || t > r.last)) r.last = t;
  }
  for (const p of plays || []) {
    if (!p.campaign) continue;
    const r = get(p.campaign);
    r.plays += 1;
    const key = p.anon_id || `row:${p.id}`;
    r.players.add(key);
    const game = String(p.quiz_id || '').replace(/-\d{1,2}-\d{1,2}-\d{2}$/, '');
    if (game) r.games.set(game, (r.games.get(game) || 0) + 1);
  }
  return Array.from(byCampaign.values())
    .map((r) => ({
      ...r,
      scans: r.scanKeys.size,
      people: r.people.size,
      players: r.players.size,
      topPlaces: Array.from(r.places.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3),
      topGames: Array.from(r.games.entries()).sort((a, b) => b[1] - a[1]).slice(0, 4),
    }))
    .sort((a, b) => b.scans - a.scans || a.campaign.localeCompare(b.campaign));
}

export default async function CampaignsPage() {
  if (!isAdmin()) redirect('/admin/login');

  // Both reads are best-effort: before migration 40 is applied the table and the
  // column do not exist, and the page should say so rather than crash.
  const [hitsRes, playsRes] = await Promise.all([
    fetchAllRows(supabaseAdmin, 'campaign_hits', 'id, campaign, path, visitor_id, referrer_host, country, region, city, ua_browser, ua_os, is_mobile, is_bot, created_at', [['created_at', false], 'id']),
    fetchAllRows(supabaseAdmin, 'quiz_results', 'id, quiz_id, anon_id, campaign, created_at', [['created_at', false], 'id']),
  ]);
  const pending = Boolean(hitsRes.error);
  const rows = rollup(hitsRes.data || [], playsRes.error ? [] : (playsRes.data || []));

  const th = { textAlign: 'left', padding: '10px 12px', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.faded, borderBottom: `1px solid ${C.line}`, whiteSpace: 'nowrap' };
  const td = { padding: '12px', borderBottom: `1px solid ${C.line}`, fontSize: 14, verticalAlign: 'top' };

  return (
    <div style={{ minHeight: '100vh', background: C.cream, fontFamily: SANS, color: C.ink }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 20px 80px' }}>
        <Link href="/admin" style={{ fontSize: 13, color: C.faded, textDecoration: 'none' }}>
          &larr; Editor&rsquo;s Desk
        </Link>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: '14px 0 6px' }}>Campaigns</h1>
        <p style={{ color: C.faded, fontSize: 14, margin: '0 0 26px', maxWidth: 640, lineHeight: 1.55 }}>
          Every printed QR code and shared placement carries a <code>?c=</code> code. This is what each
          one brought in: how many landings it produced, how many separate people that was, and how many
          of them stayed to finish a game.
        </p>

        {pending && (
          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '14px 16px', marginBottom: 24, fontSize: 14, lineHeight: 1.5 }}>
            <strong>Waiting on the database.</strong> Run{' '}
            <code>supabase/migrations/40_campaign_hits.sql</code> in the Supabase SQL Editor and this
            page fills in. Links already work in the meantime; landings are simply not being recorded yet.
          </div>
        )}

        {!pending && rows.length === 0 && (
          <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: '28px 20px', fontSize: 14, color: C.faded }}>
            No campaign landings recorded yet.
          </div>
        )}

        {rows.length > 0 && (
          <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={th}>Campaign</th>
                    <th style={th}>Scans</th>
                    <th style={th}>Landings</th>
                    <th style={th}>People</th>
                    <th style={th}>Players</th>
                    <th style={th}>Played on</th>
                    <th style={th}>Games</th>
                    <th style={th}>Mobile</th>
                    <th style={th}>Where</th>
                    <th style={th}>First</th>
                    <th style={th}>Last</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.campaign}>
                      <td style={{ ...td, fontWeight: 700 }}>
                        {r.campaign}
                        {r.botScans > 0 && (
                          <div style={{ fontSize: 11, color: C.faded, fontWeight: 400, marginTop: 3 }}>
                            +{r.botScans} bot
                          </div>
                        )}
                      </td>
                      <td style={{ ...td, fontWeight: 700 }}>{r.scans}</td>
                      <td style={{ ...td, color: C.faded }}>{r.landings}</td>
                      <td style={td}>{r.people}</td>
                      <td style={{ ...td, color: r.players > 0 ? C.forest : C.faded, fontWeight: 700 }}>{r.players}</td>
                      <td style={td}>{pct(r.players, r.people)}</td>
                      <td style={td}>{r.plays}</td>
                      <td style={td}>{pct(r.mobile, r.landings)}</td>
                      <td style={{ ...td, fontSize: 12, color: C.faded }}>
                        {r.topPlaces.length
                          ? r.topPlaces.map(([p, n]) => <div key={p}>{p} ({n})</div>)
                          : '—'}
                      </td>
                      <td style={{ ...td, fontSize: 12, color: C.faded, whiteSpace: 'nowrap' }}>{fmtDate(r.first)}</td>
                      <td style={{ ...td, fontSize: 12, color: C.faded, whiteSpace: 'nowrap' }}>{fmtDate(r.last)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ marginTop: 30, fontSize: 13, color: C.faded, lineHeight: 1.6, maxWidth: 680 }}>
          <p style={{ margin: '0 0 8px' }}>
            <strong style={{ color: C.ink }}>Scans</strong> count once per browser per day, so someone
            refreshing the page does not inflate the number; <strong style={{ color: C.ink }}>Landings</strong>{' '}
            is the raw hit count.{' '}
            <strong style={{ color: C.ink }}>People</strong> is distinct browsers.{' '}
            <strong style={{ color: C.ink }}>Players</strong> is how many of those people went on to
            finish a game within 30 days of arriving.
          </p>
          <p style={{ margin: 0 }}>
            To launch a new placement, just link to any page with{' '}
            <code>?c=your-code</code> on the end. No setup needed, the code shows up here on its first scan.
          </p>
        </div>
      </div>
    </div>
  );
}
