import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-server';
import { fetchAllRows } from '@/lib/fetch-all';
import { redirect } from 'next/navigation';
import AdminClient from './AdminClient';
import { LISTS } from '@/lib/data';
import { QUIZZES } from '@/lib/quizzes';
import { DESCRIPTIONS } from '@/lib/descriptions';
import { HERO_IMAGES } from '@/lib/hero-images';

export const dynamic = 'force-dynamic';

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
    fetchAllRows(supabaseAdmin, 'quiz_results', 'quiz_id, score', ['id']),
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
  // plays + score sum per quiz, from completed games.
  const quizPlaysMap = new Map();
  const quizScoreSumMap = new Map();
  for (const r of (quizResultsRes && quizResultsRes.data) || []) {
    quizPlaysMap.set(r.quiz_id, (quizPlaysMap.get(r.quiz_id) || 0) + 1);
    quizScoreSumMap.set(r.quiz_id, (quizScoreSumMap.get(r.quiz_id) || 0) + (Number(r.score) || 0));
  }
  const quizTitles = new Map((Array.isArray(QUIZZES) ? QUIZZES : []).map((q) => [q.id, q.title]));
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
      initialQuizSignups={quizSignups}
      initialQuizStats={quizStats}
    />
  );
}
