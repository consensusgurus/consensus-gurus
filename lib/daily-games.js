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
//
// Order matches lib/daily-combined DAILY_KEYS (the daily-slate order); 'circa' is
// retired but kept so its archived days keep scoring.
const RAW = [
  { key: 'crux', name: 'Crux', cat: 'Word', tag: 'A clueless crossword', how: 'Eight words interlock in an empty grid, and four category hints are the only clues you get.', color: '#0e1d40', colorNavy: '#5b9bff' },
  { key: 'emcee', name: 'Emcee', cat: 'Word', tag: 'The daily mini crossword', how: 'Fill a five by five crossword from fair clues, and the timer stops when the grid is right.', color: '#c026d3', colorNavy: '#e879f9' },
  { key: 'garble', name: 'Garble', cat: 'Word', tag: 'Untangle five words', how: 'Untangle five scrambled words, then the clued finale, in as few misses as you can manage.', color: '#8a6d1a', colorNavy: '#f0c95a' },
  { key: 'links', name: 'Links', cat: 'Word', tag: 'Four hidden threads', how: 'Sort sixteen words into the four hidden threads that connect them, with four mistakes to spare.', color: '#166534', colorNavy: '#4ca878' },
  { key: 'span', name: 'Span', cat: 'Geography', tag: 'Cross the map', how: 'Connect the two countries with the shortest chain of shared land borders you can find.', color: '#9d174d', colorNavy: '#e06aa0' },
  { key: 'dating', name: 'Dating', cat: 'History', tag: 'Put history in order', how: 'Arrange five historical moments oldest to newest, in three checks or fewer.', color: '#6d28d9', colorNavy: '#a483f0' },
  { key: 'tally', name: 'Tally', cat: 'Numbers', tag: 'Balance the books', how: 'Fill the grid from your rack so every row and column adds up to its target.', color: '#15803d', colorNavy: '#4cb377' },
  { key: 'suds', name: 'Suds', cat: 'Numbers', tag: 'The daily sudoku', how: 'Fill the nine by nine grid so every row, column, and box holds one through nine exactly once.', color: '#ea580c', colorNavy: '#f0894c' },
  { key: 'circa', name: 'Circa', cat: 'History', tag: 'Guess the year', how: 'Guess the year the moment happened, and each miss narrows the range.', color: '#0e7490', colorNavy: '#38b6cf' },
  { key: 'extra', name: 'Extra', cat: 'History', tag: 'Name the story', how: 'Name the redacted historic headline, and every wrong guess tears another word free.', color: '#b91c1c', colorNavy: '#e06a6a' },
  { key: 'carve', name: 'Carve', cat: 'Numbers', tag: 'Equal-sum blocks', how: 'Slice the grid into connected blocks that each add up to the same target.', color: '#7c3aed', colorNavy: '#a483f0' },
  { key: 'stet', name: 'Stet', cat: 'Word', tag: 'Spot the error, fix the copy', how: 'Each sentence may hide one wrong word, so tap it and fix it, or stamp clean copy stet.', color: '#0369a1', colorNavy: '#41b1e8' },
  { key: 'outwit', name: 'Outwit', cat: 'Crowd Psychology', tag: 'Beat the crowd', how: 'Five prompts with no right answers, where the aim is to match what the crowd does today.', color: '#1f2937', colorNavy: '#c3cfe3' },
  { key: 'tuck', name: 'Tuck', cat: 'Word', tag: 'Same letters, highest score wins', how: 'Everyone plays the same fourteen letters, and the highest scoring board wins the day.', color: '#92400e', colorNavy: '#e0a568' },
  { key: 'alibi', name: 'Alibi', cat: 'Logic', tag: 'Solve the nightly whodunit', how: "Four suspects and three deduction boards narrow tonight's case to exactly one answer.", color: '#8b1e2d', colorNavy: '#ef8896' },
  { key: 'cipher', name: 'Cipher', cat: 'Numbers', tag: 'Crack the letter math', how: 'Every letter stands for a different digit, and exactly one solution makes the equation true.', color: '#0f766e', colorNavy: '#3fc9b8' },
  { key: 'ping', name: 'Ping', cat: 'Geography', tag: 'Guess the secret city', how: 'Guess a city, learn the exact miles to the secret one, and home in on it.', color: '#0284c7', colorNavy: '#4cb3f0' },
  { key: 'warmer', name: 'Warmer', cat: 'Word', tag: 'Hotter or colder', how: 'Every guess is scored by meaning, cold to hot, until you land on the secret word.', color: '#dc2626', colorNavy: '#f3705c' },
  { key: 'jester', name: 'Jesters', cat: 'Logic', tag: 'Seat the court', how: 'Seat one jester per row, per column, and per colored court, with no two ever touching.', color: '#7c3aed', colorNavy: '#a78bfa' },
  { key: 'sworn', name: 'Sworn', cat: 'Logic', tag: 'Spot the liars', how: 'Five sworn statements contain an exact number of lies, and one of them names the thief.', color: '#be185d', colorNavy: '#f472b6' },
  { key: 'outrank', name: 'Outrank', cat: 'Crowd Psychology', tag: 'Call the crowd\'s order', how: "Vote for your favorite, then call the order the rest of today's players put them in.", color: '#4338ca', colorNavy: '#818cf8' },
  { key: 'shards', name: 'Shards', cat: 'Word', tag: 'Reassemble the crossword', how: 'The solved grid was shattered into lettered pieces, so put them back until every word reads true.', color: '#0d9488', colorNavy: '#2dd4bf' },
  { key: 'axiom', name: 'Axiom', cat: 'Logic', tag: 'Find the hidden rule', how: 'One hidden rule splits the board, and your handful of tests must tell five candidate rules apart.', color: '#0f766e', colorNavy: '#5eead4' },
  { key: 'hearsay', name: 'Hearsay', cat: 'Logic', tag: 'Deduce what they don\'t know', how: 'Two people each know one detail, and their conversation narrows the shortlist to a single answer.', color: '#7c2d92', colorNavy: '#d8b4fe' },
  { key: 'venn', name: 'Venn', cat: 'Logic', tag: 'Sort the overlaps', how: 'Place twelve words across seven regions so the count on every circle adds up.', color: '#b45309', colorNavy: '#fbbf24' },
  { key: 'stands', name: 'Stands', cat: 'Logic', tag: 'Rebuild the results', how: 'Everyone played everyone once, so rebuild the full results table from the few surviving facts.', color: '#1d4ed8', colorNavy: '#93c5fd' },
  { key: 'bracket', name: 'Bracket', cat: 'History', tag: 'Name every winner', how: 'Make fifteen picks through a sixteen team bracket, where an early miss sinks every later line.', color: '#c2410c', colorNavy: '#fb923c' },
  { key: 'lode', name: 'Lode', cat: 'Word', tag: 'Seven letters, rare words pay', how: 'Build words from seven letters around the core letter, and the rarer the word the bigger the pay.', color: '#a16207', colorNavy: '#e0b13f' },
  { key: 'etch', name: 'Etch', cat: 'Logic', tag: 'A picture in the numbers', how: 'Fill the squares the row and column clues force, and a picture appears.', color: '#4d7c0f', colorNavy: '#a3e635' },
  { key: 'hedge', name: 'Hedge', cat: 'Numbers', tag: 'Draw one closed loop', how: 'Draw one closed loop so every number has exactly that many sides on it.', color: '#0891b2', colorNavy: '#67e8f9' },
  { key: 'listed', name: 'Listed', cat: 'History', tag: 'Rank the list, top to bottom', how: 'Rank eight real things in order, where green locks a pick and amber means one place off.', color: '#86198f', colorNavy: '#e9b8f5' },
  { key: 'mate', name: 'Mate', cat: 'Logic', tag: 'White to play and mate', how: 'Find the one move that forces checkmate, then play the line out against the best defence.', color: '#6b4423', colorNavy: '#d9b38c' },
  { key: 'four', name: 'Four', cat: 'Logic', tag: 'One column wins', how: 'The position is already won for you. Find the single column that keeps it, because a wrong drop is not taken back.', color: '#1e3a8a', colorNavy: '#9db8ff' },
  { key: 'park', name: 'Park', cat: 'Logic', tag: 'Free the red block', how: 'Slide the blocks out of each other\u2019s way and get the red one to the gap, in as few moves as par allows.', color: '#7c5c2e', colorNavy: '#f0cf9a' },
  { key: 'check', name: 'Check', cat: 'Logic', tag: 'Give a piece, take them all', how: 'Captures are compulsory, so hand one over and every black piece falls inside three moves.', color: '#166e5a', colorNavy: '#5fd6b8' },
  { key: 'rung', name: 'Rung', cat: 'Word', tag: 'One letter at a time', how: 'Climb from one five-letter word to another, changing a single letter a rung, in as few as par allows.', color: '#155e75', colorNavy: '#7fd4e8' },
  { key: 'taire', name: 'Taire', cat: 'Logic', tag: 'The daily solitaire', how: 'Twenty cards face up, two suits, and a par that is the proven minimum, so nobody beats it.', color: '#1d6b4f', colorNavy: '#86efac' },
  { key: 'fib', name: 'Fib', cat: 'Logic', tag: 'One clue is lying', how: 'Every sign points at the larger number, but one of them is lying. Solve the grid, then name the liar.', color: '#4c1d95', colorNavy: '#c4b5fd' },
  { key: 'crunch', name: 'Crunch', cat: 'Numbers', tag: 'Six numbers, one target', how: 'Add, subtract, multiply and divide six numbers into a three-digit target, never going negative or fractional.', color: '#b45309', colorNavy: '#f0c07a' },
];

// Each entry gets its conventional route, button image, and localStorage key.
export const DAILY_GAMES = RAW.map((g) => ({
  ...g, href: `/${g.key}`, img: `/games/btn-${g.key}.png`, store: `sot_${g.key}_day`,
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
