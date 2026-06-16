// Shared anonymous-player aggregation for the quiz leaderboard + admin panel.
//
// An "anonymous player" is someone who completed quizzes WITHOUT signing up.
// Their games are batched by the per-browser anon_id token (quiz_results.anon_id,
// added in migration 22). Each player is shown under a STABLE pseudo-random
// 5-digit number ("Player #48217") derived from a hash of their anon_id, so the
// same browser maps to the same label everywhere (leaderboard + admin). Rows
// with no anon_id (pre-migration plays) can't be batched, so each such row is
// its own one-off player keyed by its row id.

function hashStr(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// rows: quiz_results rows, each at least { id, user_id, quiz_id, score, total, anon_id, created_at? }
// Returns one object per anonymous player:
//   { key, num, label, plays, quizzes, correct, perfect, accuracy, weighted, lastPlayed }
export function buildAnonPlayers(rows) {
  const anonRows = (rows || []).filter((r) => !r.user_id);
  const byKey = new Map();
  for (const r of anonRows) {
    const key = r.anon_id ? `a:${r.anon_id}` : `r:${r.id}`;
    let g = byKey.get(key);
    if (!g) { g = []; byKey.set(key, g); }
    g.push(r);
  }
  // Sorted keys so number assignment + collision resolution is deterministic
  // (identical between the leaderboard route and the admin page).
  const keys = [...byKey.keys()].sort();
  const used = new Set();
  const players = [];
  for (const key of keys) {
    const grp = byKey.get(key);
    let plays = 0, correct = 0, lastPlayed = '';
    const quizSet = new Set();
    const perfectSet = new Set();
    const firstByQuiz = new Map(); // first attempt per quiz, for accuracy
    for (const r of grp) {
      plays += 1;
      correct += Number(r.score) || 0;
      quizSet.add(r.quiz_id);
      if (r.total > 0 && r.score === r.total) perfectSet.add(r.quiz_id);
      const prev = firstByQuiz.get(r.quiz_id);
      if (!prev || (r.id || 0) < (prev.id || 0)) firstByQuiz.set(r.quiz_id, r);
      const c = String(r.created_at || '');
      if (c > lastPlayed) lastPlayed = c;
    }
    let accSum = 0, accN = 0;
    for (const r of firstByQuiz.values()) { if (r.total > 0) { accSum += r.score / r.total; accN += 1; } }
    const accuracy = accN ? Math.round((accSum / accN) * 1000) / 10 : 0; // percent, 1dp
    const weighted = Math.round(accSum * 10) / 10;                       // accuracy x quizzes
    let n = (hashStr(key) % 90000) + 10000;
    while (used.has(n)) { n = n >= 99999 ? 10000 : n + 1; }
    used.add(n);
    players.push({
      key, num: n, label: `Player #${n}`,
      plays, quizzes: quizSet.size, correct, perfect: perfectSet.size,
      accuracy, weighted, lastPlayed: lastPlayed || null,
    });
  }
  return players;
}
