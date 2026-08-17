// EXTENSION IS REQUIRED on this relative import. Webpack resolves it either
// way, but scripts/verify-daily-five.mjs imports this file directly under node,
// where ESM does not do extension guessing. lib/daily-games.js carries the same
// './sunday-editions.js' for the same reason. Do not drop it.
import { DAILY_GAME_MAP, isRetiredDaily, etTodayISO } from './daily-games.js';

// THE DAILY FIVE — five dailies, one from each of five different categories,
// played as one sitting, with a single leaderboard that ranks on the COMBINED
// placement across all five (owner, 2026-08-17).
//
// It is a LENS OVER THE ROSTER, never a second content stream. The five are the
// same puzzles everybody else plays, on the same dates, scored by the same
// engine. Nothing here stores a result, and a game played on its own still
// counts toward the run: there is nothing to opt into and no way to be locked
// out of it by playing in the wrong order.
//
// WHY COMBINED PLACEMENT AND NOT SCORE. The five games do not share a unit: a
// mini crossword is 25 squares, a mini sudoku is a clock, Dating is five events
// in order, Four is binary. Raw scores are not comparable, so the run converts
// each game's FINISH into the fixed ladder lib/daily-combined already pays
// (15/12/10/8/7/6/5/4/3/2/1 by position, see gamePoints) and adds the five up.
// Max 75. That is why the board is served by /api/quiz/daily-combined?five=1
// rather than by a route of its own: it is the existing combined board over a
// five-game slate with bestN 5. No new scoring, no new storage, no new mirror
// of a comparator that this file would then have to keep in step.
//
// FOUR RULES FOR THE BANK, all of them load-bearing:
//
//   1. FIVE DIFFERENT CATEGORIES, every day. That is what makes the run a
//      spread rather than a genre, what gives it five different boards and five
//      different end screens, and what makes the combined board a test of range
//      instead of a second copy of one game's leaderboard. Enforced by
//      scripts/verify-daily-five.mjs, which fails a day with a repeated cat.
//
//   2. A TIME BUDGET, NOT A GAME COUNT, and the day is ORDERED SHORTEST FIRST,
//      LONGEST LAST (owner, 2026-08-17). Two separate things, both measured
//      rather than guessed:
//
//      The budget. Games are not interchangeable: measured over 14 days of
//      leaderboard rows, Dating's median is 22 seconds and Sando's is 1,171.
//      A weekday five is banked to 600-1000 seconds of TOP-10 median, which is
//      the fast end of the field, so an ordinary player lands around 12 to 18
//      minutes. Monday runs shorter (420-820). Without a budget the generator
//      cheerfully produced 30-minute Sundays, which is a run people stop
//      starting.
//
//      The order. Each day's five ascends by that same median, so the run opens
//      with something you finish in half a minute and closes with the one that
//      takes real time. A player who has already banked four games has a reason
//      to start the fifth; the same five with the long one first loses people
//      before they have anything invested. This is why the array order here is
//      NOT the category order (Word, Numbers, Logic, then the two rotating) that
//      an earlier draft used: the categories decide MEMBERSHIP, the clock
//      decides SEQUENCE. scripts/verify-daily-five.mjs checks the ascent against
//      a dated snapshot of those medians.
//
//   3. AT LEAST SEVEN DAYS BETWEEN REPEATS of any one game, so a fortnight of
//      runs does not read as the same five wearing different dates.
//
//   4. THE BANK IS DATED AND HAND-PICKED, never derived at read time. A derived
//      five cannot be reviewed before it ships, and it would happily pick a game
//      that published no puzzle that day. A date with no entry simply has no
//      run: fiveFor returns [], every consumer renders nothing, and the site is
//      exactly as it was. That is the correct degrade, so do NOT add a
//      computed fallback. Check the runway instead.
//
// RUNWAY: banked through 2026-09-13. Extend it before it runs out.
//
// RETIREMENT RESIZES A DAY ON ITS OWN. Keys are filtered through isRetiredDaily
// at read time rather than being written down anywhere, so when Extra retires
// (2026-09-29) any day still naming it comes back as a four. Never cache a
// day's size, and never assume fiveFor returns exactly five.
// THE FIVE SLOTS ARE Word, Numbers, Logic, then TWO ROTATING, and that shape is
// deliberate. Word, Numbers and Logic hold 15, 10 and 16 games between them, so
// anchoring on those three guarantees the run always reads as a puzzle sitting
// and guarantees the bank can always be filled. The last two slots rotate over
// Trivia, End Game, Geography, Cards, Arcade and Crowd, shared IN PROPORTION TO
// POOL SIZE: Geography, Cards and Arcade hold two games each, so giving them a
// slot as often as Trivia would put the same two games in the run every seventh
// day forever. Trivia and End Game therefore carry most of the rotation and the
// thin categories are the occasional guest.
//
// Generated against real publication data and then reviewed, never typed from
// memory: an earlier hand-written bank named four games (listed, deep, chain,
// babel) on dates their own puzzle banks do not reach, which does not fail
// anywhere at runtime. gamesForSuffix simply skips a game with no puzzle, so
// the run would have become a silent four with a 60-point ceiling and nothing
// on any surface saying so. scripts/verify-daily-five.mjs now checks exactly
// that, and it is the check to run before extending this bank.
//
// Pricer is excluded on purpose: it is pulled from the server slate (see
// GAME_PUZZLES in lib/daily-slate), so it has no board, no field and no points.
// A run cannot contain a game the scoring engine cannot see.
// Each row is IN RUN ORDER, shortest first. The trailing comment is the day's
// total and the per-game medians, both in top-10 seconds, so a reviewer can see
// the ramp and the budget without re-deriving either.
const RAW = {
  // ── week 1 ────────────────────────────────────────────────────────────────
  // 08-17 is the launch day and it is deliberately the SHORTEST five in the
  // bank at 5:42 of top-10 clock, against the 10 to 16 a normal weekday runs.
  // The run shipped mid-afternoon Eastern, so anyone starting it had a part-gone
  // day to fit it into.
  '2026-08-17': ['dating', 'four', 'emcee', 'paths', 'sixes'],     // Mon   5:42  22/30/35/111/144
  '2026-08-18': ['etch', 'outrank', 'hands', 'tuck', 'cages'],     // Tue  12:11  58/90/112/201/270
  '2026-08-19': ['ping', 'carve', 'blocks', 'docket', 'rung'],     // Wed  15:41  69/111/180/221/360
  '2026-08-20': ['chain', 'extra', 'garble', 'venn', 'quilt'],     // Thu  15:52  30/44/51/128/699
  '2026-08-21': ['mate', 'listed', 'hedge', 'shards', 'suds'],     // Fri  16:35  41/75/93/304/482
  '2026-08-22': ['streak', 'feud', 'suffice', 'babel', 'tally'],   // Sat  14:26  66/90/172/201/337
  '2026-08-23': ['turn', 'blitz', 'taire', 'hearsay', 'lode'],     // Sun  15:33  23/62/78/156/614
  // ── week 2 ────────────────────────────────────────────────────────────────
  '2026-08-24': ['deep', 'stet', 'crunch', 'jester', 'sweep'],     // Mon   8:23  37/57/63/89/257
  '2026-08-25': ['check', 'span', 'plot', 'glyph', 'cipher'],      // Tue  16:32  21/53/93/370/455
  '2026-08-26': ['etch', 'outwit', 'sixes', 'tuck', 'redact'],     // Wed  12:49  58/90/144/201/276
  '2026-08-27': ['chain', 'chomp', 'links', 'extra', 'quilt'],     // Thu  14:10  30/34/43/44/699
  '2026-08-28': ['mate', 'ping', 'stands', 'barter', 'suds'],      // Fri  16:14  41/69/180/202/482
  '2026-08-29': ['sworn', 'listed', 'feud', 'tally', 'rung'],      // Sat  15:16  54/75/90/337/360
  '2026-08-30': ['park', 'blitz', 'hands', 'blocks', 'warmer'],    // Sun  15:33  61/62/112/180/518
  // ── week 3 ────────────────────────────────────────────────────────────────
  '2026-08-31': ['dating', 'four', 'carve', 'axiom', 'strata'],    // Mon   7:46  22/30/111/114/189
  '2026-09-01': ['check', 'deep', 'jester', 'babel', 'cages'],     // Tue  10:18  21/37/89/201/270
  '2026-09-02': ['emcee', 'streak', 'outwit', 'sixes', 'fib'],     // Wed  13:06  35/66/90/144/451
  '2026-09-03': ['defend', 'stet', 'taire', 'alibi', 'cipher'],    // Thu  14:10  28/57/78/232/455
  '2026-09-04': ['extra', 'span', 'etch', 'crunch', 'lode'],       // Fri  13:52  44/53/58/63/614
  '2026-09-05': ['turn', 'paths', 'barter', 'sweep', 'tally'],     // Sat  15:30  23/111/202/257/337
  '2026-09-06': ['links', 'blitz', 'outrank', 'suffice', 'redact'],// Sun  10:43  43/62/90/172/276
  // ── week 4 ────────────────────────────────────────────────────────────────
  '2026-09-07': ['chain', 'bracket', 'plot', 'carve', 'strata'],   // Mon   7:54  30/51/93/111/189
  '2026-09-08': ['mate', 'hands', 'stands', 'cages', 'glyph'],     // Tue  16:13  41/112/180/270/370
  '2026-09-09': ['dating', 'chomp', 'emcee', 'outwit', 'suds'],    // Wed  11:03  22/34/35/90/482
  '2026-09-10': ['stet', 'ping', 'hearsay', 'blocks', 'cipher'],   // Thu  15:17  57/69/156/180/455
  '2026-09-11': ['four', 'streak', 'jester', 'sixes', 'shards'],   // Fri  10:33  30/66/89/144/304
  '2026-09-12': ['check', 'extra', 'sworn', 'crunch', 'warmer'],   // Sat  11:40  21/44/54/63/518
  '2026-09-13': ['links', 'outrank', 'hedge', 'redact', 'tally'],  // Sun  13:59  43/90/93/276/337
};

export const DAILY_FIVE = RAW;
export const FIVE_SIZE = 5;
// The run's name, in one place, because it appears on the console band, the
// in-game strip, the board header and the share text.
export const FIVE_NAME = 'The Daily Five';
// The query flag that marks a page as part of a run. It is the ONLY state a run
// carries: no cookie, no localStorage, no row in a table. A run therefore
// survives a reload, a share and a cold browser, and leaving one is just the
// same URL without the flag.
export const FIVE_PARAM = 'five';

// ── dates ────────────────────────────────────────────────────────────────────
// A local suffix/ISO pair rather than an import. lib/daily-slate carries the
// same conversion but pulls in all 63 puzzle banks, which would make this module
// server-only, and lib/daily-combined carries it too but is a much bigger module
// to drag into the client bundle for two lines of arithmetic. Keep these three
// in step; they are the same well-known 'M-D-YY' suffix every daily quizId ends
// in.
export function suffixOfIso(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) return null;
  return `${Number(m[2])}-${Number(m[3])}-${Number(m[1]) % 100}`;
}

export function isoOfSuffix(suffix) {
  const m = /^(\d{1,2})-(\d{1,2})-(\d{2})$/.exec(String(suffix || ''));
  if (!m) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `20${m[3]}-${p(m[1])}-${p(m[2])}`;
}

// ── reads ────────────────────────────────────────────────────────────────────
// The run's game keys for an ET 'YYYY-MM-DD', in run order. Unknown keys and
// retired games drop out HERE, which is the only place that filtering happens,
// so no caller has to know about either. Returns [] for a date with no entry,
// which every consumer must treat as "there is no run today" rather than as an
// error.
export function fiveFor(iso) {
  const keys = RAW[iso];
  if (!Array.isArray(keys)) return [];
  return keys.filter((k) => DAILY_GAME_MAP[k] && !isRetiredDaily(k, iso));
}

// Same, keyed by the 'M-D-YY' suffix the scoring routes and quizIds speak.
export function fiveForSuffix(suffix) {
  const iso = isoOfSuffix(suffix);
  return iso ? fiveFor(iso) : [];
}

// Today's run, in ET, the timezone every daily rolls over on.
export function todayFive(today) {
  return fiveFor(today || etTodayISO());
}

// The run's games as registry rows ({ key, name, cat, tag, href, img, ... }),
// which is what every render surface actually wants. Same filtering as fiveFor.
export function fiveGamesFor(iso) {
  return fiveFor(iso).map((k) => DAILY_GAME_MAP[k]).filter(Boolean);
}

// Is this game in that day's run? The guard every consumer wants before drawing
// a strip: a stale or hand-typed ?five=1 must not put Suds inside a run that
// does not contain it.
export function inFive(gameKey, iso) {
  return fiveFor(iso).includes(gameKey);
}

// A game's route WITH the run attached. No date is carried: a run is always
// today's, and the archive is reached by a game's own ?p=<num> instead.
// Reads href off the registry rather than deriving it, so /jesters and /parker
// (whose directories are not their keys) come out right.
export function fiveHref(key) {
  const g = DAILY_GAME_MAP[key];
  const base = (g && g.href) || `/${key}`;
  return `${base}${base.includes('?') ? '&' : '?'}${FIVE_PARAM}=1`;
}

// Read the active run off the URL. Window-based rather than useSearchParams on
// purpose: useSearchParams forces a CSR bail-out that has to sit inside a
// <Suspense> boundary, and a single page rendering a consumer outside one fails
// the whole `next build`. Every link that carries the flag is a plain <a>, so
// these are full navigations and window.location is always current on mount.
// Call it in an effect, never during render: it returns false on the server.
export function readFiveParam() {
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get(FIVE_PARAM) === '1';
  } catch (e) { return false; }
}

// The run's state for one viewer, from a set of already-played game keys.
// Deliberately takes a Set rather than fetching: every caller already holds the
// day's completions, and a run must never cost a request of its own.
//
// `done` is PLAYED-AND-FINISHED, not SOLVED. Navigation only needs to know what
// is left, so that is all this answers; the four-state colouring belongs to the
// surfaces that hold the scoring data.
export function fiveProgress(iso, doneKeys) {
  const members = fiveFor(iso);
  const has = (k) => !!(doneKeys && doneKeys.has(k));
  const done = members.filter(has);
  return {
    members,
    done: done.length,
    total: members.length,
    next: members.find((k) => !has(k)) || null,
    complete: !!members.length && done.length === members.length,
  };
}
