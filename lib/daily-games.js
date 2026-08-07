import { hasSundayEdition } from './sunday-editions.js';
// SINGLE SOURCE OF TRUTH for the daily-game roster and per-game display
// metadata. Every surface that shows a daily game (the Stat Hub, admin
// analytics, the combined leaderboard, the in-game board panel, and any future
// consumer) reads names, colors, categories, the roster (DAILY_KEYS), the dated
// quiz-id regex, and the 'Name: M/D/YY' label from here. Adding a new daily game
// then means adding ONE row to DAILY_GAMES below, plus its puzzles + client page.
//
//   color     = the game's own darker hue, for light backgrounds.
//   colorNavy = a lightened hue, for the dark navy leaderboard / strip.
//   miss      = the column header for this game's `guessesUsed` figure on the
//               daily leaderboards (DailyBoardPanel + DailyEndCard). Every game
//               posts that one shared field, but they mean DIFFERENT things by
//               it: Parker and Taire count moves, Garble and Span count misses,
//               Axiom counts tests, Crunch counts steps, Lode counts words
//               mined. Labelling them all "Miss" was wrong on most of the
//               roster (owner, 2026-08-01), so each row names its own figure.
//               `miss: null` means the game always posts 0 (no wrong answers to
//               count), and both boards then DROP the column for it rather than
//               show a column of zeros. Keep the word short: it sits in a narrow
//               right-aligned column and renders uppercase.
//
// Order matches lib/daily-combined DAILY_KEYS (the daily-slate order); 'circa' is
// retired but kept so its archived days keep scoring.
const RAW = [
  { key: 'crux', miss: 'Guesses', name: 'Crux', cat: 'Word', tag: 'A clueless crossword', how: 'Eight words interlock in an empty grid, and four category hints are the only clues you get.', color: '#0e1d40', colorNavy: '#5b9bff' },
  { key: 'emcee', miss: 'Checks', name: 'Emcee', cat: 'Word', tag: 'The daily mini crossword', how: 'Fill a five by five crossword from fair clues, and the timer stops when the grid is right.', color: '#c026d3', colorNavy: '#e879f9' },
  { key: 'garble', miss: 'Miss', name: 'Garble', cat: 'Word', tag: 'Untangle five words', how: 'Untangle five scrambled words, then the clued finale, in as few misses as you can manage.', color: '#8a6d1a', colorNavy: '#f0c95a' },
  { key: 'links', miss: 'Miss', name: 'Links', cat: 'Word', tag: 'Four hidden threads', how: 'Sort sixteen words into the four hidden threads that connect them, with four mistakes to spare.', color: '#166534', colorNavy: '#4ca878' },
  { key: 'span', miss: 'Miss', name: 'Span', cat: 'Geography', tag: 'Cross the map', how: 'Connect the two countries with the shortest chain of shared land borders you can find.', color: '#9d174d', colorNavy: '#e06aa0' },
  { key: 'dating', miss: 'Checks', name: 'Dating', cat: 'Trivia', tag: 'Put history in order', how: 'Arrange five historical moments oldest to newest, in three checks or fewer.', color: '#6d28d9', colorNavy: '#a483f0' },
  { key: 'tally', miss: 'Errors', name: 'Tally', cat: 'Numbers', tag: 'Balance the books', how: 'Fill the grid from your rack so every row and column adds up to its target.', color: '#15803d', colorNavy: '#4cb377' },
  { key: 'suds', miss: null, name: 'Suds', cat: 'Numbers', tag: 'The daily sudoku', how: 'Fill the nine by nine grid so every row, column, and box holds one through nine exactly once.', color: '#ea580c', colorNavy: '#f0894c' },
  { key: 'circa', miss: 'Guesses', name: 'Circa', cat: 'Trivia', tag: 'Guess the year', how: 'Guess the year the moment happened, and each miss narrows the range.', color: '#0e7490', colorNavy: '#38b6cf' },
  { key: 'extra', miss: 'Tears', name: 'Extra', cat: 'Trivia', tag: 'Name the story', how: 'Name the redacted historic headline, and every wrong guess tears another word free.', color: '#b91c1c', colorNavy: '#e06a6a' },
  { key: 'carve', miss: 'Errors', name: 'Carve', cat: 'Numbers', tag: 'Equal-sum blocks', how: 'Slice the grid into connected blocks that each add up to the same target.', color: '#7c3aed', colorNavy: '#a483f0' },
  { key: 'stet', miss: 'Miss', name: 'Stet', cat: 'Word', tag: 'Spot the error, fix the copy', how: 'Each sentence may hide one wrong word, so tap it and fix it, or stamp clean copy stet.', color: '#0369a1', colorNavy: '#41b1e8' },
  { key: 'outwit', miss: null, name: 'Outwit', cat: 'Crowd Psychology', tag: 'Beat the crowd', how: 'Five prompts with no right answers, where the aim is to match what the crowd does today.', color: '#1f2937', colorNavy: '#c3cfe3' },
  { key: 'tuck', miss: 'Unused', name: 'Tuck', cat: 'Word', tag: 'Same letters, highest score wins', how: 'Everyone plays the same fourteen letters, and the highest scoring board wins the day.', color: '#92400e', colorNavy: '#e0a568' },
  { key: 'alibi', miss: 'Wrong', name: 'Alibi', cat: 'Logic', tag: 'Solve the nightly whodunit', how: "Four suspects and three deduction boards narrow tonight's case to exactly one answer.", color: '#8b1e2d', colorNavy: '#ef8896' },
  { key: 'cipher', miss: 'Checks', name: 'Cipher', cat: 'Numbers', tag: 'Crack the letter math', how: 'Every letter stands for a different digit, and exactly one solution makes the equation true.', color: '#0f766e', colorNavy: '#3fc9b8' },
  { key: 'ping', miss: 'Guesses', name: 'Ping', cat: 'Geography', tag: 'Guess the secret city', how: 'Guess a city, learn the exact miles to the secret one, and home in on it.', color: '#0284c7', colorNavy: '#4cb3f0' },
  { key: 'warmer', miss: 'Guesses', name: 'Warmer', cat: 'Word', tag: 'Hotter or colder', how: 'Every guess is scored by meaning, cold to hot, until you land on the secret word.', color: '#dc2626', colorNavy: '#f3705c' },
  { key: 'jester', miss: 'Placed', name: 'Jesters', cat: 'Logic', tag: 'Seat the court', how: 'Seat one jester per row, per column, and per colored court, with no two ever touching. Sundays seat two apiece.', color: '#7c3aed', colorNavy: '#a78bfa' },
  { key: 'sworn', miss: 'Wrong', name: 'Sworn', cat: 'Logic', tag: 'Spot the liars', how: 'Five sworn statements contain an exact number of lies, and one of them names the thief.', color: '#be185d', colorNavy: '#f472b6' },
  { key: 'outrank', miss: null, name: 'Outrank', cat: 'Crowd Psychology', tag: 'Call the crowd\'s order', how: "Vote for your favorite, then call the order the rest of today's players put them in.", color: '#4338ca', colorNavy: '#818cf8' },
  { key: 'shards', miss: 'Miss', name: 'Shards', cat: 'Word', tag: 'Reassemble the crossword', how: 'The solved grid was shattered into lettered pieces, so put them back until every word reads true.', color: '#0d9488', colorNavy: '#2dd4bf' },
  { key: 'axiom', miss: 'Tests', name: 'Axiom', cat: 'Logic', tag: 'Find the hidden rule', how: 'One hidden rule splits the board, and your handful of tests must tell five candidate rules apart.', color: '#0f766e', colorNavy: '#5eead4' },
  { key: 'hearsay', miss: 'Wrong', name: 'Hearsay', cat: 'Logic', tag: 'Deduce what they don\'t know', how: 'Two people each know one detail, and their conversation narrows the shortlist to a single answer.', color: '#7c2d92', colorNavy: '#d8b4fe' },
  { key: 'venn', miss: 'Rejects', name: 'Venn', cat: 'Logic', tag: 'Sort the overlaps', how: 'Place twelve words across seven regions so the count on every circle adds up.', color: '#b45309', colorNavy: '#fbbf24' },
  { key: 'stands', miss: 'Rejects', name: 'Stands', cat: 'Logic', tag: 'Rebuild the results', how: 'Everyone played everyone once, so rebuild the full results table from the few surviving facts.', color: '#1d4ed8', colorNavy: '#93c5fd' },
  { key: 'bracket', miss: null, name: 'Bracket', cat: 'Trivia', tag: 'Name every winner', how: 'Make fifteen picks through a sixteen team bracket, where an early miss sinks every later line.', color: '#c2410c', colorNavy: '#fb923c' },
  { key: 'lode', miss: 'Words', name: 'Lode', cat: 'Word', tag: 'Seven letters, rare words pay', how: 'Build words from seven letters around the core letter, and the rarer the word the bigger the pay.', color: '#a16207', colorNavy: '#e0b13f' },
  { key: 'etch', miss: 'Errors', name: 'Etch', cat: 'Logic', tag: 'A picture in the numbers', how: 'Fill the squares the row and column clues force, and a picture appears.', color: '#4d7c0f', colorNavy: '#a3e635' },
  { key: 'hedge', miss: 'Errors', name: 'Hedge', cat: 'Logic', tag: 'Draw one closed loop', how: 'Draw one closed loop so every number has exactly that many sides on it.', color: '#0891b2', colorNavy: '#67e8f9' },
  { key: 'listed', miss: 'Checks', name: 'Listed', cat: 'Trivia', tag: 'Rank the list, top to bottom', how: 'Rank eight real things in order, where green locks a pick and amber means one place off.', color: '#86198f', colorNavy: '#e9b8f5' },
  { key: 'mate', miss: 'Errors', name: 'Mate', cat: 'End Game', tag: 'White to play and mate', how: 'Find the one move that forces checkmate, then play the line out against the best defence.', color: '#6b4423', colorNavy: '#d9b38c' },
  { key: 'four', miss: 'Errors', name: 'Four', cat: 'End Game', tag: 'One column wins', how: 'The position is already won for you. Find the single column that keeps it, because a wrong drop is not taken back.', color: '#1e3a8a', colorNavy: '#9db8ff' },
  // Renamed Park -> Parker 2026-07-31 (via a short-lived Parker). The KEY stays
  // 'park' on purpose: it is the
  // quiz-id prefix ('park-M-D-YY'), the localStorage namespace and the button
  // image name, so renaming it would orphan the launch-month leaderboards and
  // every streak. Only the route and the display name moved, hence the href
  // override below.
  { key: 'park', miss: 'Moves', name: 'Parker', href: '/parker', cat: 'Logic', tag: 'Get the red one out', how: 'Everybody has blocked you in, every block is stuck on one axis, and there is one gap in the wall.', color: '#7c5c2e', colorNavy: '#f0cf9a' },
  { key: 'check', miss: 'Errors', name: 'Check', cat: 'End Game', tag: 'Give a piece, take them all', how: 'Captures are compulsory, so hand one over and every black piece falls inside three moves.', color: '#166e5a', colorNavy: '#5fd6b8' },
  { key: 'rung', miss: 'Rungs', name: 'Rung', cat: 'Word', tag: 'One letter at a time', how: 'Climb from one five-letter word to another, changing a single letter a rung, in as few rungs as you can.', color: '#155e75', colorNavy: '#7fd4e8' },
  { key: 'taire', miss: 'Moves', name: 'Taire', cat: 'Cards', tag: 'The daily solitaire', how: 'Twenty cards face up, two suits, and a perfect line that is the proven minimum, so nobody beats it.', color: '#1d6b4f', colorNavy: '#86efac' },
  { key: 'fib', miss: 'Errors', name: 'Fib', cat: 'Logic', tag: 'One clue is lying', how: 'The open end of each sign points at the larger number, but one of them is lying. Solve the grid, then name the liar.', color: '#4c1d95', colorNavy: '#c4b5fd' },
  { key: 'crunch', miss: 'Steps', name: 'Crunch', cat: 'Numbers', tag: 'Six numbers, one target', how: 'Add, subtract, multiply and divide six numbers into a three-digit target, never going negative or fractional.', color: '#b45309', colorNavy: '#f0c07a' },
  { key: 'streak', miss: 'Asked', name: 'Streak', cat: 'Trivia', tag: 'Forty questions, one life', how: 'Forty trivia questions climb from gimme to brutal, and one wrong answer or an empty clock ends the run.', color: '#e11d48', colorNavy: '#fb7185' },
  { key: 'babel', miss: 'Stuck', name: 'Babel', cat: 'End Game', tag: 'The bag is empty', how: 'Nothing left to draw, so their rack is knowable. Play the last tiles for the best spread you can force.', color: '#14532d', colorNavy: '#6ee7b7' },
  { key: 'feud', miss: null, name: 'Feud', cat: 'Crowd Psychology', tag: 'Match the crowd', how: "Five prompts, three answers each, and the answer key is whatever today's players say. It shifts all day.", color: '#9f1239', colorNavy: '#fda4af' },
  { key: 'hands', miss: 'Busts', name: 'Hands', cat: 'Cards', tag: 'The daily poker solitaire', how: 'Twenty five cards, one at a time, into a grid where every row and column is a poker hand. Same deal for everybody.', color: '#7f1d1d', colorNavy: '#fca5a5' },
  { key: 'glyph', miss: 'Checks', name: 'Glyph', cat: 'Word', tag: 'A crossword with no clues', how: 'Every letter is a number and the same number is always the same letter, so two given letters and the crossings have to carry you to all 26.', color: '#334155', colorNavy: '#94a3b8' },
  { key: 'chain', miss: 'Errors', name: 'Chain', cat: 'End Game', tag: 'Take them, or leave them', how: 'The safe edges are gone and the boxes are counted in your favour. One edge keeps it, and the free box is usually the trap.', color: '#4a044e', colorNavy: '#f0abfc' },
  { key: 'suffice', miss: 'Wrong', name: 'Suffice', cat: 'Logic', tag: 'Decide what is enough', how: 'Eight questions you never answer. Two statements each, and you say whether they settle it.', color: '#4338ca', colorNavy: '#a5b4fc' },
  { key: 'turn', miss: 'Errors', name: 'Turn', cat: 'End Game', tag: 'Ten squares left', how: 'An Othello endgame you are already winning. One square keeps it, and flipping the fewest discs is the habit that gets you beaten.', color: '#226218', colorNavy: '#8cda81' },
  { key: 'redact', miss: 'Guesses', name: 'Redact', cat: 'Trivia', tag: 'Uncover the story', how: 'An entire article about one famous subject, every word hidden. Guess words to uncover it wherever they appear, and name the subject to win.', color: '#27272a', colorNavy: '#b9bdc7' },
  { key: 'paths', miss: 'Over', name: 'Paths', cat: 'Logic', tag: 'Link every town', how: 'One depot, a scatter of towns, a river in the way. Lay track until they all connect, and pay as little as you can for it. The terrain gets meaner as the week goes on.', color: '#065f46', colorNavy: '#34d399' },
  { key: 'deep', miss: 'Asked', name: 'Deep', cat: 'Trivia', tag: 'One topic, fifteen questions', how: 'One subject a day and fifteen questions on it, from gimmes to expert. One wrong answer ends the dive, so your score is how far down you got.', color: '#0c4a6e', colorNavy: '#7dd3fc' },
  { key: 'anon', miss: null, name: 'Anon', cat: 'Word', tag: 'A clueless acrostic', how: "An unsigned passage and a bank of answers that share its letters, and the answers' first letters spell whoever wrote it.", color: '#8c2f39', colorNavy: '#e8969f' },
  { key: 'strata', miss: 'Hints', name: 'Strata', cat: 'Word', tag: 'Dig the words out', how: 'Every letter belongs to a buried word, and lifting one out drops everything above it, which is how the next one becomes readable.', color: '#9a3412', colorNavy: '#f4a06a' },
];

// Each entry gets its conventional route, button image, and localStorage key.
// A row may override href when its route no longer matches its key (Parker,
// renamed from Park while keeping the 'park' quiz-id prefix). img and store stay
// key-derived so no asset or saved game has to move.
export const DAILY_GAMES = RAW.map((g) => ({
  ...g, href: g.href || `/${g.key}`, img: `/games/btn-${g.key}.png`, store: `sot_${g.key}_day`,
}));

export const DAILY_KEYS = DAILY_GAMES.map((g) => g.key);
export const DAILY_GAME_MAP = Object.fromEntries(DAILY_GAMES.map((g) => [g.key, g]));

// Display name for a game key, with a Title-cased fallback for an unknown key.
export function dailyGameName(key) {
  const g = DAILY_GAME_MAP[key];
  return g ? g.name : (key ? key.charAt(0).toUpperCase() + key.slice(1) : key);
}

// A daily play is stored under the quiz_id '<key>-M-D-YY'. DAILY_DATED_RE matches
// only known games; DAILY_ANY_RE matches the shape for any key so a brand-new
// game still gets a clean 'Name: M/D/YY' label the moment it is added above.
export const DAILY_DATED_RE = new RegExp('^(' + DAILY_KEYS.join('|') + ')-(\\d{1,2})-(\\d{1,2})-(\\d{2})$');
const DAILY_ANY_RE = /^([a-z]+)-(\d{1,2})-(\d{1,2})-(\d{2})$/;
export function dailyLabel(id) {
  const m = DAILY_ANY_RE.exec(id || '');
  if (!m) return null;
  const [, key, mo, dy, yr] = m;
  const base = `${dailyGameName(key)}: ${Number(mo)}/${Number(dy)}/${yr}`;
  const date = new Date(Date.UTC(2000 + Number(yr), Number(mo) - 1, Number(dy)));
  if (date.getUTCDay() === 0 && hasSundayEdition(key)) return `${base} (Sunday Edition)`;
  return base;
}

// The department key a dated daily instance files under. Daily days used to be
// hand-seeded into QUIZZES with a matching per-id QUIZ_DEPT entry; this mirrors the
// departments those seeds carried (Word -> word, Geography -> geography,
// Numbers -> science, Logic and the rest -> entertainment) so a row derived from
// play data lands exactly where its seeded siblings did. Keyed off the roster's
// `cat` above, so a new game is filed the moment it is added there.
const DAILY_CAT_DEPT = { Word: 'word', Geography: 'geography', Numbers: 'science' };
export function dailyDept(id) {
  const m = DAILY_DATED_RE.exec(id || '');
  const g = m && DAILY_GAME_MAP[m[1]];
  return (g && DAILY_CAT_DEPT[g.cat]) || 'entertainment';
}
