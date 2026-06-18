import { fetchAllRows } from './fetch-all';

// Loads quiz_results for the Elo/stats routes, preferring the correct_count
// column (exact correctness) but gracefully falling back if the column is not
// present yet (pre-migration 24), so a deploy never depends on migration timing.
const COLS = 'id, user_id, username, quiz_id, score, total, correct_count, anon_id, created_at';
const COLS_NOCC = 'id, user_id, username, quiz_id, score, total, anon_id, created_at';

export async function loadQuizResults(admin) {
  let r = await fetchAllRows(admin, 'quiz_results', COLS, ['id']);
  if (r.error) {
    const m = `${r.error.message || ''} ${r.error.code || ''}`;
    if (r.error.code === '42703' || /correct_count/.test(m)) {
      r = await fetchAllRows(admin, 'quiz_results', COLS_NOCC, ['id']);
    }
  }
  return r;
}
