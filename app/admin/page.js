import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';
import { LISTS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';
import { buildAnonPlayers } from '@/lib/quiz-anon';
import { buildGeoMapData } from '@/lib/geo-locate';
import { DESCRIPTIONS } from '@/lib/descriptions';
import { HERO_IMAGES } from '@/lib/hero-images';

export const dynamic = 'force-dynamic';

// quiz_results carries optional metadata columns added over several migrations
// (correct_count -> 24, is_mobile -> 25, country/region/ua_browser/ua_os -> 26,
// city/timezone/referrer/language -> 27) that may not all be applied yet. Read
// the richest column set, and on a missing-column error progressively drop the
// newest columns, so the admin page never hard-fails on a not-yet-migrated DB.
async function fetchQuizResults() {
  const order = [['created_at', false], 'id'];
  const colSets = [
    'id, quiz_id, user_id, score, total, correct_count, time_elapsed, created_at, anon_id, is_mobile, country, region, ua_browser, ua_os, city, timezone, referrer, language',
    'id, quiz_id, user_id, score, total, correct_count, time_elapsed, created_at, anon_id, is_mobile, country, region, ua_browser, ua_os',
    'id, quiz_id, user_id, score, total, correct_count, time_elapsed, created_at, anon_id',
    'id, quiz_id, user_id, score, total, time_elapsed, created_at, anon_id',
    'id, quiz_id, user_id, score, total, time_elapsed, created_at',
  ];
  let last = null;
  for (const cols of colSets) {
    last = await fetchAllRows(supabaseAdmin, 'quiz_results', cols, order);
    if (!last.error) return last;
    const code = last.error.code;
    const missing = code === '42703' || code === 'PGRST204' || /column|schema cache/i.test(last.error.message || '');
    if (!missing) return last; // a real error, not a missing column — surface it
  }
  return last;
}

// Per-play traffic metadata, derived from a quiz_results row. device is
// Mobile/Desktop from is_mobile (null -> "—"); geo is the finest available
// "City, Region, Country" (e.g. "Austin, TX, US"); browser/os are the coarse
// parsed user-agent; timezone/language/referrer come from migration 27.
function playMeta(r) {
  const geoParts = [r.city, r.region, r.country].filter(Boolean);
  return {
    device: r.is_mobile === true ? 'Mobile' : r.is_mobile === false ? 'Desktop' : null,
    geo: geoParts.length ? geoParts.join(', ') : null,
    browser: r.ua_browser || null,
    os: r.ua_os || null,
    timezone: r.timezone || null,
    language: r.language || null,
    referrer: r.referrer || null,
  };
}

// Distinct non-null values of a field across a player's plays, preserving the
// plays' order (which arrives newest-first), so the admin MultiCell shows the
// most-recent value first with a "+N" for the rest.
function distinctNewestFirst(plays, field) {
  const seen = new Set();
  const out = [];
  for (const p of plays || []) {
    const v = p[field];
    if (v && !seen.has(v)) { seen.add(v); out.push(v); }
  }
  return out;
}

// Aggregate a player's whole play history into the engagement / tenure /
// behavioral stats the admin surfaces (and the distinct device/os/geo/etc sets).
// Works for registered and anonymous players alike, from the same play-row shape.
// Bucket play timestamps in US Eastern so "Peak time" and active-day counts use
// the admin's (Eastern) clock, matching the client-rendered "Last" column. This
// page renders server-side in UTC, so Date.getHours()/getDay() would report UTC.
const ET_FMT = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York', weekday: 'short', hour: '2-digit', hourCycle: 'h23',
  year: 'numeric', month: '2-digit', day: '2-digit',
});
const ET_DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function etParts(d) {
  const parts = ET_FMT.formatToParts(d);
  const get = (t) => { const p = parts.find((x) => x.type === t); return p ? p.value : ''; };
  return { hour: parseInt(get('hour'), 10) % 24, dow: ET_DOW[get('weekday')] ?? 0, day: `${get('year')}-${get('month')}-${get('day')}` };
}
// A session is a sitting, not a day: a new session starts when the gap since
// the player's previous play exceeds SESSION_GAP_MS (30 minutes). Mirrored by
// sessionsFromPlays in AdminClient.jsx.
const SESSION_GAP_MS = 30 * 60 * 1000;
function playerStats(plays) {
  const list = plays || [];
  let bestScore = null, timeSum = 0, timeN = 0, accSum = 0, accN = 0, perfect = 0, firstSeen = '', lastSeen = '';
  const quizCount = new Map();
  const days = new Set();
  const hours = new Array(24).fill(0);
  const dows = new Array(7).fill(0);
  for (const p of list) {
    if (typeof p.score === 'number') bestScore = bestScore == null ? p.score : Math.max(bestScore, p.score);
    if (typeof p.timeElapsed === 'number' && p.timeElapsed >= 0) { timeSum += p.timeElapsed; timeN += 1; }
    // Accuracy = score as a fraction of the max possible (score/total), averaged
    // over plays. This is the ONLY consistent measure across formats: typed
    // "name them all" quizzes don't record correct_count, and the timed
    // multiple-choice / survival quizzes store total as MAX POINTS (e.g. 300)
    // while correct_count is a question count (e.g. 9) — so correct_count/total
    // would read ~3%. score is always 0..total, so score/total is 0..1 for every
    // quiz and matches the "perfect" definition (score === total).
    if (typeof p.score === 'number' && typeof p.total === 'number' && p.total > 0) {
      accSum += Math.max(0, Math.min(1, p.score / p.total));
      accN += 1;
    }
    if (typeof p.total === 'number' && p.total > 0 && p.score === p.total) perfect += 1;
    const label = p.title || p.quizId;
    if (label) quizCount.set(label, (quizCount.get(label) || 0) + 1);
    const c = String(p.createdAt || '');
    if (c) {
      if (!firstSeen || c < firstSeen) firstSeen = c;
      if (!lastSeen || c > lastSeen) lastSeen = c;
      const d = new Date(p.createdAt);
      if (!Number.isNaN(d.getTime())) { const et = etParts(d); days.add(et.day); hours[et.hour] += 1; dows[et.dow] += 1; }
    }
  }
  const times = [];
  for (const p of list) { const t = Date.parse(p.createdAt); if (!Number.isNaN(t)) times.push(t); }
  times.sort((a, b) => a - b);
  let sessions = 0;
  for (let i = 0; i < times.length; i++) if (i === 0 || times[i] - times[i - 1] > SESSION_GAP_MS) sessions += 1;
  let mostPlayed = null, mostN = 0;
  for (const [q, cnt] of quizCount) if (cnt > mostN) { mostN = cnt; mostPlayed = q; }
  const anyTime = hours.some((v) => v > 0);
  const peakHour = anyTime ? hours.reduce((b, v, i, a) => (v > a[b] ? i : b), 0) : null;
  const peakDow = anyTime ? dows.reduce((b, v, i, a) => (v > a[b] ? i : b), 0) : null;
  return {
    plays: list.length,
    quizzes: quizCount.size,
    accuracy: accN ? Math.round((accSum / accN) * 100) : null,
    bestScore,
    avgTime: timeN ? Math.round(timeSum / timeN) : null,
    perfect,
    firstSeen: firstSeen || null,
    lastSeen: lastSeen || null,
    activeDays: days.size,
    sessions,
    mostPlayed: mostPlayed ? { title: mostPlayed, count: mostN } : null,
    peakHour,
    peakDow,
    devices: distinctNewestFirst(list, 'device'),
    oses: distinctNewestFirst(list, 'os'),
    browsers: distinctNewestFirst(list, 'browser'),
    geos: distinctNewestFirst(list, 'geo'),
    timezones: distinctNewestFirst(list, 'timezone'),
    languages: distinctNewestFirst(list, 'language'),
    referrers: distinctNewestFirst(list, 'referrer'),
  };
}

// Active-user counts (DAU/WAU/MAU) from completed quiz games. A player's
// identity is their registered user_id, else their browser anon_id, else the
// row id (a lone anonymous play). A player counts once per rolling window if
// they finished any game inside it. This is the "active players" signal,
// available from existing data with full history; the broader "unique visitors"
// signal comes from visitor_active_counts() once migration 30 is applied.
function activePlayerCounts(rows) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const dau = new Set(), wau = new Set(), mau = new Set();
  for (const r of rows || []) {
    const t = r.created_at ? new Date(r.created_at).getTime() : NaN;
    if (Number.isNaN(t)) continue;
    const age = now - t;
    if (age > 30 * DAY) continue;
    const key = r.user_id ? `u:${r.user_id}` : r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`;
    mau.add(key);
    if (age <= 7 * DAY) wau.add(key);
    if (age <= DAY) dau.add(key);
  }
  return { dau: dau.size, wau: wau.size, mau: mau.size };
}

// Daily-games return play (Analytics -> Return Play). For each of the four
// daily games (Links, Span, Crux, Garble), bucket players by how many DISTINCT
// days they have completed it — each daily puzzle has a unique quiz_id per date
// (e.g. links-7-13-26), so distinct quiz_ids == distinct days a player came
// back. Also a cross-game breadth histogram: how many of the four games each
// player has ever touched. Player identity is the same rule the active-user
// counts use (registered user_id, else browser anon_id, else the lone row id),
// so anonymous browsers — the bulk of daily-game players — are counted.
const DAILY_GAMES = [
  { key: 'links', title: 'Links' },
  { key: 'span', title: 'Span' },
  { key: 'crux', title: 'Crux' },
  { key: 'garble', title: 'Garble' },
  { key: 'dating', title: 'Dating' },
  { key: 'tally', title: 'Tally' },
  { key: 'suds', title: 'Suds' },
];
const DAILY_PREFIX_RE = /^(links|span|crux|garble|dating|tally|suds)-/;
function buildDailyRetention(rows) {
  const perGame = new Map(DAILY_GAMES.map((g) => [g.key, new Map()])); // key -> (playerKey -> Set(quizId))
  const breadth = new Map(); // playerKey -> Set(gameKey)
  for (const r of rows || []) {
    const qid = r.quiz_id || '';
    const m = DAILY_PREFIX_RE.exec(qid);
    if (!m) continue;
    const gk = m[1];
    const pkey = r.user_id ? `u:${r.user_id}` : r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`;
    const gmap = perGame.get(gk);
    let set = gmap.get(pkey);
    if (!set) { set = new Set(); gmap.set(pkey, set); }
    set.add(qid);
    let gs = breadth.get(pkey);
    if (!gs) { gs = new Set(); breadth.set(pkey, gs); }
    gs.add(gk);
  }
  const games = DAILY_GAMES.map((g) => {
    const gmap = perGame.get(g.key);
    const counts = new Map(); // distinct-days -> number of players
    let players = 0, dayPlays = 0, returning = 0, maxDays = 0;
    for (const [, set] of gmap) {
      const d = set.size;
      counts.set(d, (counts.get(d) || 0) + 1);
      players += 1;
      dayPlays += d;
      if (d >= 2) returning += 1;
      if (d > maxDays) maxDays = d;
    }
    const histogram = [];
    for (let d = 1; d <= maxDays; d++) histogram.push({ days: d, count: counts.get(d) || 0 });
    return { key: g.key, title: g.title, players, dayPlays, returning, maxDays, histogram };
  });
  const bcounts = new Map();
  let bTotal = 0;
  for (const [, gs] of breadth) { const n = gs.size; bcounts.set(n, (bcounts.get(n) || 0) + 1); bTotal += 1; }
  const bhist = [];
  for (let n = 1; n <= DAILY_GAMES.length; n++) bhist.push({ games: n, count: bcounts.get(n) || 0 });
  return { games, breadth: { total: bTotal, histogram: bhist } };
}

export const metadata = {
  title: 'Editor\'s Desk | Source of Truths',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isAdmin()) {
    redirect('/admin/login');
  }

  const [submissionsRes, extrasRes, votesRes, complaintsRes, voteEventsRes, alertsRes, trendingRes, totalViewsRes, listCommentsRes, voteCountsRes, editorNotesRes, quizUsersRes, quizTrendingRes, quizTotalViewsRes, quizResultsRes, visitorActiveRes] = await Promise.all([
    fetchAllRows(supabaseAdmin, 'user_lists', '*', [['submitted_at', false], 'id']),
    fetchAllRows(supabaseAdmin, 'extras', 'list_id, item_name, added_at', [['added_at', false], 'list_id', 'item_name']),
    fetchAllRows(supabaseAdmin, 'votes', 'list_id, item_name, score, updated_at', [['updated_at', false], 'list_id', 'item_name']),
    fetchAllRows(supabaseAdmin, 'complaints', '*', [['created_at', false], 'id']),
    supabaseAdmin
      .from('vote_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200),
    supabaseAdmin
      .from('consensus_alerts')
      .select('id, list_id, item_name, change_type, rank, detected_at')
      .eq('resolved', false)
      .order('detected_at', { ascending: false }),
    supabaseAdmin.rpc('trending_views', { p_hours: 24 }),
    fetchAllRows(supabaseAdmin, 'views', 'list_id, count', ['list_id']),
    fetchAllRows(supabaseAdmin, 'list_comments', 'id, list_id, name, body, created_at, editor_response', [['created_at', false], 'id']),
    fetchAllRows(supabaseAdmin, 'vote_events', 'list_id, item_name', ['id']),
    fetchAllRows(supabaseAdmin, 'list_editor_notes', 'id, list_id, note, created_at', [['created_at', false], 'id']),
    // Quiz email signups (the /quiz join form). Service-role read; quiz_users
    // has RLS with no policies, so only the admin key can see the emails.
    fetchAllRows(supabaseAdmin, 'quiz_users', 'id, username, email, created_at', [['created_at', false], 'id']),
    // Quiz analytics: rolling-24h views (quiz_view_events), all-time view
    // totals (quiz_views), and every completed game (quiz_results) for play
    // counts + average score per quiz.
    supabaseAdmin.rpc('quiz_trending_views', { p_hours: 24 }),
    fetchAllRows(supabaseAdmin, 'quiz_views', 'quiz_id, count', ['quiz_id']),
    fetchQuizResults(),
    // Site-wide distinct-visitor DAU/WAU/MAU (migration 30). Best-effort:
    // returns an error if the RPC/columns aren't applied yet, handled below.
    supabaseAdmin.rpc('visitor_active_counts'),
  ]);

  if (submissionsRes.error) {
    console.error('admin user_lists fetch error', submissionsRes.error);
  }
  if (extrasRes.error) {
    console.error('admin extras fetch error', extrasRes.error);
  }
  if (votesRes.error) {
    console.error('admin votes fetch error', votesRes.error);
  }

  const lists = (submissionsRes.data || []).map((row) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    type: row.type,
    blurb: row.blurb,
    items: (row.sources?.ai?.items) || row.vote_items || [],
    published: row.published,
    submittedAt: row.submitted_at,
  }));

  // Build a (list_id, item_name) -> score map for fast lookup
  const scoreMap = new Map();
  for (const v of votesRes.data || []) {
    scoreMap.set(`${v.list_id} ${v.item_name}`, v.score);
  }

  // Group extras by list_id
  const extrasByList = new Map();
  for (const row of extrasRes.data || []) {
    if (!extrasByList.has(row.list_id)) extrasByList.set(row.list_id, []);
    extrasByList.get(row.list_id).push({
      name: row.item_name,
      score: scoreMap.get(`${row.list_id} ${row.item_name}`) || 0,
      addedAt: row.added_at,
    });
  }

  const extras = Array.from(extrasByList.entries())
    .map(([listId, items]) => ({ listId, items }))
    .sort((a, b) => {
      // Most recent submission first (items are already newest-first per group)
      const aNewest = a.items[0]?.addedAt || '';
      const bNewest = b.items[0]?.addedAt || '';
      return bNewest.localeCompare(aNewest);
    });

  if (complaintsRes && complaintsRes.error) {
    console.error('admin complaints fetch error', complaintsRes.error);
  }
  const complaints = ((complaintsRes && complaintsRes.data) || []).map((row) => ({
    id: row.id,
    listId: row.list_id,
    listTitle: row.list_title,
    message: row.message,
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    editorResponse: row.editor_response || null,
  }));

  if (voteEventsRes && voteEventsRes.error) {
    console.error('admin vote_events fetch error', voteEventsRes.error);
  }
  const voteCountMap = new Map();
  for (const ev of (voteCountsRes && voteCountsRes.data) || []) {
    const k = `${ev.list_id}::${ev.item_name}`;
    voteCountMap.set(k, (voteCountMap.get(k) || 0) + 1);
  }
  const voteStandings = (votesRes.data || []).map((row) => ({
    listId: row.list_id,
    itemName: row.item_name,
    score: row.score,
    votes: voteCountMap.get(`${row.list_id}::${row.item_name}`) || 0,
    updatedAt: row.updated_at,
  }));
  const comments = ((listCommentsRes && listCommentsRes.data) || []).map((row) => ({
    id: row.id,
    listId: row.list_id,
    name: row.name,
    body: row.body,
    createdAt: row.created_at,
    editorResponse: row.editor_response || null,
  }));
  const voteEvents = ((voteEventsRes && voteEventsRes.data) || []).map((row) => ({
    id: row.id,
    listId: row.list_id,
    itemName: row.item_name,
    delta: row.delta,
    createdAt: row.created_at,
  }));

  if (alertsRes && alertsRes.error) {
    console.error('admin consensus_alerts fetch error', alertsRes.error);
  }
  const listTitles = new Map(LISTS.map((l) => [l.id, l.title]));
  const alerts = ((alertsRes && alertsRes.data) || []).map((row) => {
    const descs = DESCRIPTIONS[row.list_id] || {};
    const imgs = HERO_IMAGES[row.list_id] || {};
    return {
      id: row.id,
      listId: row.list_id,
      listTitle: listTitles.get(row.list_id) || row.list_id,
      itemName: row.item_name,
      changeType: row.change_type,
      rank: row.rank,
      detectedAt: row.detected_at,
      hasDescription: Boolean(descs[row.item_name]),
      hasHeroImage: Boolean(imgs[row.item_name]),
    };
  });

  // Per-list visitor counts over the past 24 hours (from view_events),
  // plus all-time totals (from views) for context. Covers every curated
  // list and any published user list that logged a view.
  if (trendingRes && trendingRes.error) {
    console.error('admin trending_views fetch error', trendingRes.error);
  }
  if (totalViewsRes && totalViewsRes.error) {
    console.error('admin views fetch error', totalViewsRes.error);
  }
  const views24Map = new Map(
    ((trendingRes && trendingRes.data) || []).map((row) => [row.list_id, Number(row.cnt) || 0])
  );
  const totalViewsMap = new Map(
    ((totalViewsRes && totalViewsRes.data) || []).map((row) => [row.list_id, Number(row.count) || 0])
  );
  const viewListIds = new Set([
    ...LISTS.map((l) => l.id),
    ...views24Map.keys(),
  ]);
  const views24h = Array.from(viewListIds)
    .map((listId) => ({
      listId,
      title: listTitles.get(listId) || listId,
      views24h: views24Map.get(listId) || 0,
      viewsTotal: totalViewsMap.get(listId) || 0,
    }))
    .sort(
      (a, b) =>
        b.views24h - a.views24h ||
        b.viewsTotal - a.viewsTotal ||
        a.title.localeCompare(b.title)
    );

  const editorNotes = ((editorNotesRes && editorNotesRes.data) || []).map((row) => ({ id: row.id, listId: row.list_id, note: row.note, createdAt: row.created_at }));

  if (quizUsersRes && quizUsersRes.error) {
    console.error('admin quiz_users fetch error', quizUsersRes.error);
  }
  const quizSignups = ((quizUsersRes && quizUsersRes.data) || []).map((row) => ({
    id: row.id,
    username: row.username,
    email: row.email,
    createdAt: row.created_at,
  }));

  // Per-quiz analytics: 24h views, all-time views, plays, and average score.
  if (quizTrendingRes && quizTrendingRes.error) {
    console.error('admin quiz_trending_views fetch error', quizTrendingRes.error);
  }
  if (quizTotalViewsRes && quizTotalViewsRes.error) {
    console.error('admin quiz_views fetch error', quizTotalViewsRes.error);
  }
  if (quizResultsRes && quizResultsRes.error) {
    console.error('admin quiz_results fetch error', quizResultsRes.error);
  }
  const quizViews24Map = new Map(
    ((quizTrendingRes && quizTrendingRes.data) || []).map((row) => [row.quiz_id, Number(row.cnt) || 0])
  );
  const quizTotalViewsMap = new Map(
    ((quizTotalViewsRes && quizTotalViewsRes.data) || []).map((row) => [row.quiz_id, Number(row.count) || 0])
  );
  // plays + score sum per quiz, from completed games, plus a mobile-play count
  // (is_mobile === true) so Quiz Stats can show the mobile share per quiz.
  const quizPlaysMap = new Map();
  const quizPlays24Map = new Map();
  const quizScoreSumMap = new Map();
  const quizMobileMap = new Map();
  const quizPlaysCutoff24 = Date.now() - 24 * 60 * 60 * 1000;
  for (const r of (quizResultsRes && quizResultsRes.data) || []) {
    quizPlaysMap.set(r.quiz_id, (quizPlaysMap.get(r.quiz_id) || 0) + 1);
    if (r.created_at && new Date(r.created_at).getTime() >= quizPlaysCutoff24) {
      quizPlays24Map.set(r.quiz_id, (quizPlays24Map.get(r.quiz_id) || 0) + 1);
    }
    quizScoreSumMap.set(r.quiz_id, (quizScoreSumMap.get(r.quiz_id) || 0) + (Number(r.score) || 0));
    if (r.is_mobile === true) quizMobileMap.set(r.quiz_id, (quizMobileMap.get(r.quiz_id) || 0) + 1);
  }
  const quizTitles = new Map((Array.isArray(QUIZZES) ? QUIZZES : []).map((q) => [q.id, q.title]));
  // Non-quiz pages whose page views are tracked through the quiz-view system so
  // they surface in this analytics panel (the Kids zone hub and games).
  const KIDS_PAGES = {
    kids: { title: 'Kids Corner (hub)', href: '/kids' },
    'kids-memory-match': { title: 'Kids · Treats Match', href: '/kids/memory-match' },
    'kids-pizza-match': { title: 'Kids · Pizza Match', href: '/kids/pizza-match' },
    'kids-dog-match': { title: 'Kids · Dog Match', href: '/kids/dog-match' },
    'kids-color-match': { title: 'Kids · Color Match', href: '/kids/color-match' },
    'kids-addition-match': { title: 'Kids · Addition Match', href: '/kids/addition-match' },
    'kids-letter-match': { title: 'Kids · Letter Match', href: '/kids/letter-match' },
    'kids-fantasy-match': { title: 'Kids · Fantasy Match', href: '/kids/fantasy-match' },
    'kids-word-match': { title: 'Kids · Word Match', href: '/kids/word-match' },
    'kids-number-match': { title: 'Kids · Number Match', href: '/kids/number-match' },
  };
  for (const [id, m] of Object.entries(KIDS_PAGES)) quizTitles.set(id, m.title);
  // Per-signup play history: every completed game attributed to each user
  // (quiz_results.user_id -> quiz_users.id), newest first, with the quiz title
  // resolved. Lets the Quiz Signups panel show which quizzes a person played
  // and how many times.
  const playsByUser = new Map();
  for (const r of (quizResultsRes && quizResultsRes.data) || []) {
    if (!r.user_id) continue;
    if (!playsByUser.has(r.user_id)) playsByUser.set(r.user_id, []);
    playsByUser.get(r.user_id).push({
      quizId: r.quiz_id,
      title: quizTitles.get(r.quiz_id) || r.quiz_id,
      score: r.score,
      total: r.total,
      correct: r.correct_count != null ? r.correct_count : null,
      timeElapsed: r.time_elapsed,
      createdAt: r.created_at,
      ...playMeta(r),
    });
  }
  // Anonymous players: completed games with no signed-up user_id, batched by
  // browser (anon_id) under a stable random number. Mirrors the signups table.
  const anonPlayersBase = buildAnonPlayers((quizResultsRes && quizResultsRes.data) || []);
  // Per-player game history (which quizzes a browser played and when), keyed the
  // same way buildAnonPlayers batches rows (a:<anon_id>, else r:<row id>), so the
  // Anonymous Players panel can expand a row to its individual plays, the same
  // detail the Quiz Signups panel shows for registered users.
  const anonHistoryByKey = new Map();
  for (const r of (quizResultsRes && quizResultsRes.data) || []) {
    if (r.user_id) continue;
    const key = r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`;
    if (!anonHistoryByKey.has(key)) anonHistoryByKey.set(key, []);
    anonHistoryByKey.get(key).push({
      quizId: r.quiz_id,
      title: quizTitles.get(r.quiz_id) || r.quiz_id,
      score: r.score,
      total: r.total,
      correct: r.correct_count != null ? r.correct_count : null,
      timeElapsed: r.time_elapsed,
      createdAt: r.created_at,
      ...playMeta(r),
    });
  }
  const anonPlayers = anonPlayersBase.map((p) => {
    const history = (anonHistoryByKey.get(p.key) || []).sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
    const stats = playerStats(history);
    return {
      ...p,
      history,
      stats,
      devices: stats.devices,
      browsers: stats.browsers,
      geos: stats.geos,
      oses: stats.oses,
    };
  });

  const quizSignupsWithPlays = quizSignups.map((s) => {
    const plays = (playsByUser.get(s.id) || []).sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
    const stats = playerStats(plays);
    return {
      ...s,
      plays,
      playCount: plays.length,
      stats,
      devices: stats.devices,
      browsers: stats.browsers,
      geos: stats.geos,
      oses: stats.oses,
    };
  });
  const quizIds = new Set([
    ...(Array.isArray(QUIZZES) ? QUIZZES.map((q) => q.id) : []),
    ...quizViews24Map.keys(),
    ...quizTotalViewsMap.keys(),
    ...quizPlaysMap.keys(),
  ]);
  const quizStats = Array.from(quizIds)
    .map((quizId) => {
      const plays = quizPlaysMap.get(quizId) || 0;
      const scoreSum = quizScoreSumMap.get(quizId) || 0;
      return {
        quizId,
        title: quizTitles.get(quizId) || quizId,
        href: KIDS_PAGES[quizId] ? KIDS_PAGES[quizId].href : `/quiz/${encodeURIComponent(quizId)}`,
        views24h: quizViews24Map.get(quizId) || 0,
        viewsTotal: quizTotalViewsMap.get(quizId) || 0,
        plays,
        plays24h: quizPlays24Map.get(quizId) || 0,
        mobilePlays: quizMobileMap.get(quizId) || 0,
        avgScore: plays > 0 ? Math.round((scoreSum / plays) * 10) / 10 : null,
      };
    })
    .sort(
      (a, b) =>
        b.views24h - a.views24h ||
        b.plays - a.plays ||
        b.viewsTotal - a.viewsTotal ||
        a.title.localeCompare(b.title)
    );

  // DAU/WAU/MAU. players = distinct quiz players (works now, full history);
  // visitors = distinct site visitors from visitor_active_counts() (fills in
  // once migration 30 is applied, else null so the UI shows a "pending" note).
  const activePlayers = activePlayerCounts((quizResultsRes && quizResultsRes.data) || []);
  if (visitorActiveRes && visitorActiveRes.error) {
    console.error('admin visitor_active_counts fetch error', visitorActiveRes.error);
  }
  const vRow = (visitorActiveRes && Array.isArray(visitorActiveRes.data) && visitorActiveRes.data[0]) || null;
  const activeVisitors = vRow
    ? { dau: Number(vRow.dau) || 0, wau: Number(vRow.wau) || 0, mau: Number(vRow.mau) || 0 }
    : null;
  const activeUsers = { players: activePlayers, visitors: activeVisitors };

  // Player-location maps (Analytics -> Player Map): users + games played by
  // location over the full located-play history (migrations 26/27), resolved
  // server-side so the ~2MB coordinate index never ships to the client.
  const geoMap = buildGeoMapData((quizResultsRes && quizResultsRes.data) || []);

  // Daily-games return-play distribution (Analytics -> Return Play).
  const dailyRetention = buildDailyRetention((quizResultsRes && quizResultsRes.data) || []);

  return (
    <AdminClient
      initialLists={lists}
      initialExtras={extras}
      initialComplaints={complaints}
      initialVoteStandings={voteStandings}
      initialVoteEvents={voteEvents}
      initialComments={comments}
      initialEditorNotes={editorNotes}
      initialAlerts={alerts}
      initialViews24h={views24h}
      initialQuizSignups={quizSignupsWithPlays}
      initialQuizStats={quizStats}
      initialAnonPlayers={anonPlayers}
      initialActiveUsers={activeUsers}
      initialGeoMap={geoMap}
      initialDailyRetention={dailyRetention}
    />
  );
}
