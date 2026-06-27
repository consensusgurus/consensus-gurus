import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';
import { LISTS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';
import { buildAnonPlayers } from '@/lib/quiz-anon';
import { DESCRIPTIONS } from '@/lib/descriptions';
import { HERO_IMAGES } from '@/lib/hero-images';

export const dynamic = 'force-dynamic';

// quiz_results carries optional traffic-metadata columns (is_mobile -> migration
// 25, country/region/ua_browser/ua_os -> migration 26) that may not be applied
// yet. Read the richest column set, and on a missing-column error progressively
// drop the meta columns, then anon_id, so the admin page never hard-fails on a
// not-yet-migrated database.
async function fetchQuizResults() {
  const order = [['created_at', false], 'id'];
  const colSets = [
    'id, quiz_id, user_id, score, total, time_elapsed, created_at, anon_id, is_mobile, country, region, ua_browser, ua_os',
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
// Mobile/Desktop from the boolean is_mobile (null -> shown as "—"); geo is the
// country, or "country-region" when a subdivision is known (e.g. US-CA);
// browser is the coarse parsed user-agent browser.
function playMeta(r) {
  return {
    device: r.is_mobile === true ? 'Mobile' : r.is_mobile === false ? 'Desktop' : null,
    geo: r.country ? (r.region ? `${r.country}-${r.region}` : r.country) : null,
    browser: r.ua_browser || null,
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

export const metadata = {
  title: 'Editor\'s Desk | Source of Truths',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!isAdmin()) {
    redirect('/admin/login');
  }

  const [submissionsRes, extrasRes, votesRes, complaintsRes, voteEventsRes, alertsRes, trendingRes, totalViewsRes, listCommentsRes, voteCountsRes, editorNotesRes, quizUsersRes, quizTrendingRes, quizTotalViewsRes, quizResultsRes] = await Promise.all([
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
  const quizScoreSumMap = new Map();
  const quizMobileMap = new Map();
  for (const r of (quizResultsRes && quizResultsRes.data) || []) {
    quizPlaysMap.set(r.quiz_id, (quizPlaysMap.get(r.quiz_id) || 0) + 1);
    quizScoreSumMap.set(r.quiz_id, (quizScoreSumMap.get(r.quiz_id) || 0) + (Number(r.score) || 0));
    if (r.is_mobile === true) quizMobileMap.set(r.quiz_id, (quizMobileMap.get(r.quiz_id) || 0) + 1);
  }
  const quizTitles = new Map((Array.isArray(QUIZZES) ? QUIZZES : []).map((q) => [q.id, q.title]));
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
      timeElapsed: r.time_elapsed,
      createdAt: r.created_at,
      ...playMeta(r),
    });
  }
  const anonPlayers = anonPlayersBase.map((p) => {
    const history = (anonHistoryByKey.get(p.key) || []).sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
    return {
      ...p,
      history,
      devices: distinctNewestFirst(history, 'device'),
      browsers: distinctNewestFirst(history, 'browser'),
      geos: distinctNewestFirst(history, 'geo'),
    };
  });

  const quizSignupsWithPlays = quizSignups.map((s) => {
    const plays = (playsByUser.get(s.id) || []).sort((a, b) =>
      String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
    );
    return {
      ...s,
      plays,
      playCount: plays.length,
      devices: distinctNewestFirst(plays, 'device'),
      browsers: distinctNewestFirst(plays, 'browser'),
      geos: distinctNewestFirst(plays, 'geo'),
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
        views24h: quizViews24Map.get(quizId) || 0,
        viewsTotal: quizTotalViewsMap.get(quizId) || 0,
        plays,
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
    />
  );
}
