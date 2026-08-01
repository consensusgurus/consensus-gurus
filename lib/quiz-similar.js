// Shared "play next" picker used by the end-game recap on every quiz board.
//
// Deterministic ladder (given the played set): the next UNPLAYED part of the
// current quiz's series, else an unplayed quiz in the same category, then the
// same department, then any unplayed quiz, and finally (everything played) a
// stable other quiz. Being deterministic (no Math.random) matters: the title
// shown on the recap button is computed from the same ladder as the navigation
// target, so the button always goes where its label says.
import { QUIZZES } from './quizzes';
import { quizDept } from './quiz-departments';
import { isBusinessNewsHubQuiz } from './business-news-hub';

// The base id a quiz's series hangs off, for the rail's one-per-series rule.
// Strips a trailing part number in either shape the site uses ('-2', '-pt2'),
// but never a 4-digit year, so a dated quiz stays its own series.
export function seriesBase(id) {
  const str = String(id || '');
  const m = str.match(/-(?:pt\.?-?)?(\d+)$/i);
  if (!m || m[1].length >= 4) return str;
  return str.slice(0, m.index);
}

function partNumOf(id) {
  const m = id.match(/-(\d+)$/);
  return m ? parseInt(m[1], 10) : 1;
}

// Family signature: two quizzes are the SAME KIND when their titles share the same
// two-word suffix (e.g. "... Character Match") OR the same three-word prefix (e.g.
// "Match the Capital ..."), after stripping a trailing "(Pt. N)". This lets a
// distinct-per-title family (every "<Show> Character Match", the photo/poster/cover
// sets, etc.) group together even though each quiz carries its own category. The
// two-word suffix is specific enough to avoid the generic "Name the ..." grouping.
export function titleFamilyKeys(title) {
  const w = String(title || '')
    .replace(/\((?:pt\.?|part)\s*[\divx]+\)\s*$/i, '')
    .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  return { suf: w.length >= 2 ? w.slice(-2).join(' ') : null,
           pre: w.length >= 3 ? w.slice(0, 3).join(' ') : null };
}

// Quizzes that are the same KIND as `quiz` (per titleFamilyKeys), excluding itself
// and any hidden-from-related quiz.
export function familyQuizzes(quiz) {
  if (!quiz) return [];
  const k = titleFamilyKeys(quiz.title);
  if (!k.suf && !k.pre) return [];
  return QUIZZES.filter((q) => {
    if (!q || !q.id || q.id === quiz.id || q.hideFromRelated) return false;
    const k2 = titleFamilyKeys(q.title);
    return (k.suf && k2.suf === k.suf) || (k.pre && k2.pre === k.pre);
  });
}

// The quizzes in the current quiz's series (stripped base + numbered siblings),
// INCLUDING the current quiz, in part order. A 4-digit trailing number is a year
// (date slug), never a part, so dated quizzes are treated as standalone.
export function seriesSet(quiz) {
  if (!quiz || !quiz.id) return [];
  const stripped = quiz.id.replace(/-\d+$/, '');
  const m = quiz.id.match(/-(\d+)$/);
  const suffix = m ? parseInt(m[1], 10) : null;
  if ((suffix != null && suffix >= 1000) || /-\d{4}(-\d{2})*$/.test(stripped)) return [quiz];
  return QUIZZES
    .filter((q) => q && q.id && !q.hideFromRelated && q.id.replace(/-\d+$/, '') === stripped)
    .sort((a, b) => partNumOf(a.id) - partNumOf(b.id));
}

// Quiz ids the player has completed at least once, from the client-side stats
// keys (sot_quiz_<id> with attempts > 0). Empty on the server / when unavailable.
export function playedQuizIds() {
  const out = new Set();
  if (typeof window === 'undefined') return out;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k.indexOf('sot_quiz_') !== 0) continue;
      const id = k.slice('sot_quiz_'.length);
      if (id === 'identity' || id === 'anon' || id === 'retry') continue;
      let v;
      try { v = JSON.parse(localStorage.getItem(k)); } catch (e) { v = null; }
      if (v && typeof v === 'object' && (v.attempts || 0) > 0) out.add(id);
    }
  } catch (e) { /* localStorage unavailable */ }
  return out;
}

// Whether `candidate` may be offered as a similar / play-next pick while the player
// is on `source`.
//
// HARD RULE (owner, 2026-07-31): a Business News hub quiz is NEVER a similar or
// auto-play pick, on ANY quiz, including another Business News quiz. That covers
// the dated news recaps (daily-market-news / daily- and weekly-business /
// earnings-reporter), the per-company quarterly earnings quizzes, the lightning
// rounds, and the thematic sector updates. They are all dated, one-off, and read
// as stale the moment their news cycle passes, so recommending one is worse than
// recommending nothing.
//
// The consequence is deliberate: finishing a market-news quiz now advances to an
// EVERGREEN business quiz instead. Those share `category: 'Business'` (and the
// 'business' department) with the news quizzes, so the same-category tier of the
// ladder below lands on exactly the right pool with no special-casing here:
// name the brand from the logo, match the CEO to their company, match the
// company to its headquarters, and the rest of the standing business set.
export function allowInSimilar(source, candidate) {
  if (!candidate || !candidate.id) return false;
  return !isBusinessNewsHubQuiz(candidate.id);
}

function pickNext(quiz, played) {
  if (!quiz || !quiz.id) return null;
  const seen = played instanceof Set ? played : new Set();
  const usable = (q) => q && q.id && q.id !== quiz.id && !q.hideFromRelated && !q.unlisted && allowInSimilar(quiz, q);
  const set = seriesSet(quiz);
  const curPart = partNumOf(quiz.id);
  const siblings = set.filter((q) => q.id !== quiz.id);

  const laterUnplayed = siblings.filter((q) => partNumOf(q.id) > curPart).find((q) => !seen.has(q.id));
  if (laterUnplayed) return laterUnplayed;
  const anyUnplayedPart = siblings.find((q) => !seen.has(q.id));
  if (anyUnplayedPart) return anyUnplayedPart;

  const d = quizDept(quiz);
  const sameCat = QUIZZES.find((q) => usable(q) && quiz.category && q.category === quiz.category && !seen.has(q.id));
  if (sameCat) return sameCat;
  const fam = familyQuizzes(quiz).find((q) => usable(q) && !seen.has(q.id));
  if (fam) return fam;
  const sameDept = QUIZZES.find((q) => usable(q) && quizDept(q) === d && !seen.has(q.id));
  if (sameDept) return sameDept;
  const anyUnplayed = QUIZZES.find((q) => usable(q) && !seen.has(q.id));
  if (anyUnplayed) return anyUnplayed;

  // Everything played: a stable same-category (else same-dept, else any) pick.
  const catPool = QUIZZES.filter((q) => usable(q) && quiz.category && q.category === quiz.category);
  const famPool = familyQuizzes(quiz).filter(usable);
  const deptPool = QUIZZES.filter((q) => usable(q) && quizDept(q) === d);
  const pool = catPool.length ? catPool : (famPool.length ? famPool : (deptPool.length ? deptPool : QUIZZES.filter(usable)));
  return pool.length ? pool[0] : null;
}

// Id only (back-compat: every board's onPlaySimilar handler calls this).
export function similarQuizId(quiz) {
  const n = pickNext(quiz, playedQuizIds());
  return n ? n.id : null;
}

// Full pick for the recap button label: { id, title, label, badge }.
// badge = { part, total } when the pick is a numbered part of this quiz's series.
export function nextQuizMeta(quiz) {
  const n = pickNext(quiz, playedQuizIds());
  if (!n) return null;
  const set = seriesSet(quiz);
  let badge = null;
  if (set.length > 1) {
    const idx = set.findIndex((q) => q.id === n.id);
    if (idx >= 0) badge = { part: idx + 1, total: set.length };
  }
  return { id: n.id, title: n.title, label: badge ? 'Up next' : 'Play next', badge };
}

// The "Similar quizzes" rail shown on every end-of-game card, as an ORDERED list
// of up to `limit` quizzes. Tiers, best match first: the other parts of this
// quiz's series, then the same KIND of quiz (title family), then the same
// category, then the same department, then anything left. Every tier passes
// through allowInSimilar, so a Business News quiz can never appear.
//
// QuizResultModal (the shared end card on twelve boards) renders from this. The
// inline QuizClient end screen keeps its own equivalent ladder because it also
// leads with the series parts it already computed, but it runs every candidate
// through the same allowInSimilar gate. Before this existed the modal had its own
// copy that skipped that gate entirely, which is why finishing a market-news quiz
// filled the rail with more market-news quizzes (owner report, 2026-07-31).
export function similarQuizzes(quiz, limit = 8) {
  if (!quiz || !quiz.id) return [];
  const usable = (q) => q && q.id && q.id !== quiz.id && !q.hideFromRelated && !q.unlisted && allowInSimilar(quiz, q);
  const d = quizDept(quiz);
  const parts = seriesSet(quiz).filter(usable);
  const family = familyQuizzes(quiz).filter(usable);
  const sameCat = QUIZZES.filter((q) => usable(q) && quiz.category && q.category === quiz.category);
  const sameDept = QUIZZES.filter((q) => usable(q) && quizDept(q) === d);
  const rest = QUIZZES.filter(usable);
  const ladder = [...family, ...sameCat, ...sameDept, ...rest];

  const seen = new Set();
  const out = [];
  const take = (q) => { seen.add(q.id); out.push(q); };
  // This quiz's own remaining parts lead, and they are exempt from the
  // one-per-series rule below (they ARE the series the player just played).
  for (const q of parts) { if (!seen.has(q.id) && out.length < limit) take(q); }

  // Everything after that is capped at ONE quiz per series, so a long series
  // cannot swallow the whole rail. Without this, a Business quiz's rail came
  // back as companies-to-headquarters parts 1 through 8 and nothing else, when
  // it should read as a spread: the logos quiz, the CEO quiz, the HQ quiz.
  const bases = new Set([seriesBase(quiz.id)]);
  for (const q of ladder) {
    if (out.length >= limit) break;
    if (seen.has(q.id)) continue;
    const b = seriesBase(q.id);
    if (bases.has(b)) continue;
    bases.add(b);
    take(q);
  }
  // Backfill with the parts we skipped, only if the pool of distinct series ran
  // out before the rail was full (a thin category).
  for (const q of ladder) {
    if (out.length >= limit) break;
    if (seen.has(q.id)) continue;
    take(q);
  }
  return out;
}
