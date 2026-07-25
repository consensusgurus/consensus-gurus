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
  { key: 'crux', name: 'Crux', cat: 'Word', tag: 'A clueless crossword', color: '#0e1d40', colorNavy: '#5b9bff' },
  { key: 'emcee', name: 'Emcee', cat: 'Word', tag: 'The daily mini crossword', color: '#c026d3', colorNavy: '#e879f9' },
  { key: 'garble', name: 'Garble', cat: 'Word', tag: 'Untangle five words', color: '#8a6d1a', colorNavy: '#f0c95a' },
  { key: 'links', name: 'Links', cat: 'Word', tag: 'Four hidden threads', color: '#166534', colorNavy: '#4ca878' },
  { key: 'span', name: 'Span', cat: 'Geography', tag: 'Cross the map', color: '#9d174d', colorNavy: '#e06aa0' },
  { key: 'dating', name: 'Dating', cat: 'History', tag: 'Put history in order', color: '#6d28d9', colorNavy: '#a483f0' },
  { key: 'tally', name: 'Tally', cat: 'Numbers', tag: 'Balance the books', color: '#15803d', colorNavy: '#4cb377' },
  { key: 'suds', name: 'Suds', cat: 'Numbers', tag: 'The daily sudoku', color: '#ea580c', colorNavy: '#f0894c' },
  { key: 'circa', name: 'Circa', cat: 'History', tag: 'Guess the year', color: '#0e7490', colorNavy: '#38b6cf' },
  { key: 'extra', name: 'Extra', cat: 'History', tag: 'Name the story', color: '#b91c1c', colorNavy: '#e06a6a' },
  { key: 'carve', name: 'Carve', cat: 'Numbers', tag: 'Equal-sum blocks', color: '#7c3aed', colorNavy: '#a483f0' },
  { key: 'stet', name: 'Stet', cat: 'Word', tag: 'Spot the error, fix the copy', color: '#0369a1', colorNavy: '#41b1e8' },
  { key: 'outwit', name: 'Outwit', cat: 'Crowd Psychology', tag: 'Beat the crowd', color: '#1f2937', colorNavy: '#c3cfe3' },
  { key: 'tuck', name: 'Tuck', cat: 'Word', tag: 'Same letters, highest score wins', color: '#92400e', colorNavy: '#e0a568' },
  { key: 'alibi', name: 'Alibi', cat: 'Logic', tag: 'Solve the nightly whodunit', color: '#8b1e2d', colorNavy: '#ef8896' },
  { key: 'cipher', name: 'Cipher', cat: 'Numbers', tag: 'Crack the letter math', color: '#0f766e', colorNavy: '#3fc9b8' },
  { key: 'ping', name: 'Ping', cat: 'Geography', tag: 'Guess the secret city', color: '#0284c7', colorNavy: '#4cb3f0' },
  { key: 'warmer', name: 'Warmer', cat: 'Word', tag: 'Hotter or colder', color: '#dc2626', colorNavy: '#f3705c' },
  { key: 'jester', name: 'Jesters', cat: 'Logic', tag: 'Seat the court', color: '#7c3aed', colorNavy: '#a78bfa' },
  { key: 'sworn', name: 'Sworn', cat: 'Logic', tag: 'Spot the liars', color: '#be185d', colorNavy: '#f472b6' },
  { key: 'outrank', name: 'Outrank', cat: 'Crowd Psychology', tag: 'Call the crowd\'s order', color: '#4338ca', colorNavy: '#818cf8' },
  { key: 'shards', name: 'Shards', cat: 'Word', tag: 'Reassemble the crossword', color: '#0d9488', colorNavy: '#2dd4bf' },
  { key: 'axiom', name: 'Axiom', cat: 'Logic', tag: 'Find the hidden rule', color: '#0f766e', colorNavy: '#5eead4' },
  { key: 'hearsay', name: 'Hearsay', cat: 'Logic', tag: 'Deduce what they don\'t know', color: '#7c2d92', colorNavy: '#d8b4fe' },
  { key: 'venn', name: 'Venn', cat: 'Logic', tag: 'Sort the overlaps', color: '#b45309', colorNavy: '#fbbf24' },
  { key: 'stands', name: 'Stands', cat: 'Logic', tag: 'Rebuild the results', color: '#1d4ed8', colorNavy: '#93c5fd' },
  { key: 'bracket', name: 'Bracket', cat: 'History', tag: 'Name every winner', color: '#c2410c', colorNavy: '#fb923c' },
  { key: 'lode', name: 'Lode', cat: 'Word', tag: 'Seven letters, rare words pay', color: '#a16207', colorNavy: '#e0b13f' },
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
  return `${dailyGameName(m[1])}: ${Number(m[2])}/${Number(m[3])}/${m[4]}`;
}
