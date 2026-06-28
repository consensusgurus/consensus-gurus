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

function partNumOf(id) {
  const m = id.match(/-(\d+)$/);
  return m ? parseInt(m[1], 10) : 1;
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

function pickNext(quiz, played) {
  if (!quiz || !quiz.id) return null;
  const seen = played instanceof Set ? played : new Set();
  const usable = (q) => q && q.id && q.id !== quiz.id && !q.hideFromRelated;
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
  const sameDept = QUIZZES.find((q) => usable(q) && quizDept(q) === d && !seen.has(q.id));
  if (sameDept) return sameDept;
  const anyUnplayed = QUIZZES.find((q) => usable(q) && !seen.has(q.id));
  if (anyUnplayed) return anyUnplayed;

  // Everything played: a stable same-category (else same-dept, else any) pick.
  const catPool = QUIZZES.filter((q) => usable(q) && quiz.category && q.category === quiz.category);
  const deptPool = QUIZZES.filter((q) => usable(q) && quizDept(q) === d);
  const pool = catPool.length ? catPool : (deptPool.length ? deptPool : QUIZZES.filter(usable));
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
