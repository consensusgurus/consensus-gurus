// Niche — the shared facts engine. One universe per day of the week, a closed
// member list per universe, and a pool of BROAD attributes per universe. A
// puzzle is three row attributes and three column attributes (four each on
// Sunday); a cell is satisfied by any member passing both its row and column
// attribute, each member usable once per board.
//
// This file is the single source of truth for what counts: the client
// validates picks with it, scripts/gen-niche.mjs builds boards from it, and
// scripts/verify-niche.mjs re-derives every cell from it. The facts tables it
// reads are authored under the GENEROUS-MATCH principle (see each table's
// header): where a fact has two defensible readings, the data says yes to
// both, because a false accept costs a shrug and a false reject costs the
// player a guess.
//
// It ships to the client on purpose. Nothing here is a spoiler: there is no
// answer key, only the public facts every valid answer is judged by.
// EXTENSIONS REQUIRED on these relative imports, like lib/daily-games.js:
// scripts/gen-niche.mjs and scripts/verify-niche.mjs import this file under
// plain node, where ESM does no extension guessing. Do not drop them.
import { PAIRS } from '../span/borders.js';
import { COUNTRIES } from './facts-countries.js';
import { STATES } from './facts-states.js';
import { ANIMALS } from './facts-animals.js';
import { MOVIES } from './facts-movies.js';
import { TVSHOWS } from './facts-tv.js';
import { MUSICIANS } from './facts-musicians.js';
import { TEAMS } from './facts-teams.js';

// ── name normalization (matching is by SELECTION from the type-ahead, so this
// only has to make search forgiving, never to disambiguate) ──────────────────
export function normAnswer(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// Land borders, symmetrized from Span's verified graph.
const ADJ = (() => {
  const m = {};
  for (const [a, b] of PAIRS) {
    (m[a] = m[a] || new Set()).add(b);
    (m[b] = m[b] || new Set()).add(a);
  }
  return m;
})();
const borders = (name) => ADJ[name] || new Set();

const strip = (t) => String(t).replace(/^The /, '');
const words = (t) => normAnswer(t).split(' ').filter(Boolean);
const NUM_WORDS = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|twenty|fifty|hundred|thousand)\b/;
const hasNumber = (t) => /\d/.test(t) || NUM_WORDS.test(normAnswer(t));
const hasDouble = (t) => /([a-z])\1/i.test(String(t).replace(/[^A-Za-z]/g, ''));
const capList = (m) => (Array.isArray(m.cap) ? m.cap : [m.cap]).filter(Boolean);
// Word count for a place name: spaces and hyphens break a word, an apostrophe
// does not, so Porto-Novo and Saint John's are two words and N'Djamena is one.
const placeWords = (t) => String(t).trim().split(/[\s-]+/).filter(Boolean).length;

// Letter attributes are generated from a template against real coverage, so
// only letters with enough members ever reach a board (gen + verify both
// enforce the cell floor anyway; MIN_LETTER keeps the pool sensible).
const MIN_LETTER = 6;
function letterAttrs(members, id, labelFor, getter) {
  const seen = {};
  for (const m of members) {
    for (const L of new Set(getter(m).map((x) => strip(x).charAt(0).toUpperCase()).filter((ch) => /[A-Z]/.test(ch)))) {
      seen[L] = (seen[L] || 0) + 1;
    }
  }
  return Object.keys(seen)
    .filter((L) => seen[L] >= MIN_LETTER)
    .sort()
    .map((L) => ({
      id: `${id}-${L.toLowerCase()}`,
      label: labelFor(L),
      test: (m) => getter(m).some((x) => strip(x).charAt(0).toUpperCase() === L),
    }));
}

// ── the seven universes ─────────────────────────────────────────────────────
// Each: { id, name, noun, members, attrs }. Attribute `w` is a pick weight for
// the generator (broad, famous facts carry more weight than letter fills).
const U_COUNTRIES = {
  id: 'countries',
  name: 'Countries',
  noun: 'country',
  members: COUNTRIES,
  attrs: [
    { id: 'cont-eu', label: 'In Europe', w: 3, test: (m) => m.c.includes('eu') },
    { id: 'cont-af', label: 'In Africa', w: 3, test: (m) => m.c.includes('af') },
    { id: 'cont-as', label: 'In Asia', w: 3, test: (m) => m.c.includes('as') },
    { id: 'cont-na', label: 'In North or Central America', w: 3, test: (m) => m.c.includes('na') },
    { id: 'cont-sa', label: 'In South America', w: 3, test: (m) => m.c.includes('sa') },
    { id: 'cont-oc', label: 'In Oceania', w: 2, test: (m) => m.c.includes('oc') },
    { id: 'll', label: 'Landlocked', w: 3, test: (m) => !!m.ll },
    { id: 'isl', label: 'An island nation', w: 3, test: (m) => !!m.isl },
    { id: 'pop100', label: 'Population over 100 million', w: 3, test: (m) => m.pop === 100 },
    { id: 'tiny', label: 'Population under 1 million', w: 2, test: (m) => m.pop === -1 },
    { id: 'eu', label: 'In the European Union', w: 3, test: (m) => !!m.eu },
    { id: 'oly', label: 'Has hosted a Summer Olympics', w: 2, test: (m) => !!m.oly },
    { id: 'nato', label: 'In NATO', w: 3, test: (m) => !!m.nato },
    { id: 'cw', label: 'In the Commonwealth', w: 3, test: (m) => !!m.cw },
    { id: 'wc', label: "Has won the men's soccer World Cup", w: 2, test: (m) => !!m.wc },
    { id: 'south', label: 'Capital in the Southern Hemisphere', w: 2, test: (m) => !!m.sh },
    { id: 'b-russia', label: 'Borders Russia', w: 2, test: (m) => borders('Russia').has(m.t) },
    { id: 'b-china', label: 'Borders China', w: 2, test: (m) => borders('China').has(m.t) },
    { id: 'b-brazil', label: 'Borders Brazil', w: 2, test: (m) => borders('Brazil').has(m.t) },
    { id: 'b-germany', label: 'Borders Germany', w: 2, test: (m) => borders('Germany').has(m.t) },
    { id: 'b-france', label: 'Borders France', w: 2, test: (m) => borders('France').has(m.t) },
    { id: 'b-india', label: 'Borders India', w: 2, test: (m) => borders('India').has(m.t) },
    { id: 'b5', label: 'Borders five or more countries', w: 2, test: (m) => borders(m.t).size >= 5 },
    { id: 'hasz', label: 'Name contains a Z', w: 1, test: (m) => /z/i.test(m.t) },
    { id: 'multi', label: 'Name has more than one word', w: 1, test: (m) => words(m.t).length > 1 },
    { id: 'endsa', label: 'Name ends in A', w: 2, test: (m) => /a$/i.test(m.t) },
    { id: 'cap2', label: 'Capital city name has more than one word', w: 2, test: (m) => capList(m).some((c) => placeWords(c) > 1) },
    ...letterAttrs(COUNTRIES, 'n', (L) => `Name starts with ${L}`, (m) => [m.t]),
    ...letterAttrs(COUNTRIES, 'cap', (L) => `Capital city starts with ${L}`, capList),
  ],
};

const U_STATES = {
  id: 'states',
  name: 'US States',
  noun: 'state',
  members: STATES,
  attrs: [
    { id: 'can', label: 'Borders Canada', w: 3, test: (m) => !!m.can },
    { id: 'mex', label: 'Borders Mexico', w: 2, test: (m) => !!m.mex },
    { id: 'oc', label: 'Has an ocean coastline', w: 3, test: (m) => !!m.oc },
    { id: 'inland', label: 'No ocean coastline', w: 3, test: (m) => !m.oc },
    { id: 'gulf', label: 'On the Gulf of Mexico', w: 2, test: (m) => !!m.gulf },
    { id: 'lakes', label: 'Touches a Great Lake', w: 3, test: (m) => !!m.lakes },
    { id: 'col', label: 'One of the thirteen colonies', w: 3, test: (m) => !!m.col },
    { id: 'pop5', label: 'Population over 5 million', w: 3, test: (m) => !!m.pop5 },
    { id: 'riv', label: 'Borders the Mississippi River', w: 2, test: (m) => !!m.riv },
    { id: 'y1700s', label: 'Joined the Union in the 1700s', w: 2, test: (m) => m.y < 1800 },
    { id: 'y1900s', label: 'Joined the Union in 1900 or later', w: 2, test: (m) => m.y >= 1900 },
    { id: 'pop2', label: 'Fewer than two million people', w: 2, test: (m) => !!m.pop2 },
    { id: 'west', label: 'West of the Mississippi', w: 3, test: (m) => !!m.west },
    { id: 'endsa', label: 'Name ends in A', w: 2, test: (m) => /a$/i.test(m.t) },
    { id: 'multi', label: 'Name has two words', w: 1, test: (m) => words(m.t).length > 1 },
    { id: 'dbl', label: 'Name has a double letter', w: 1, test: (m) => hasDouble(m.t) },
    ...letterAttrs(STATES, 'n', (L) => `Name starts with ${L}`, (m) => [m.t]),
    ...letterAttrs(STATES, 'cap', (L) => `Capital city starts with ${L}`, capList),
  ],
};

const U_ANIMALS = {
  id: 'animals',
  name: 'Animals',
  noun: 'animal',
  members: ANIMALS,
  attrs: [
    { id: 'mammal', label: 'A mammal', w: 3, test: (m) => m.cls === 'mammal' },
    { id: 'bird', label: 'A bird', w: 3, test: (m) => m.cls === 'bird' },
    { id: 'herp', label: 'A reptile or amphibian', w: 2, test: (m) => m.cls === 'reptile' || m.cls === 'amphibian' },
    { id: 'sea', label: 'A fish or other sea creature', w: 2, test: (m) => m.cls === 'fish' || (m.cls === 'invert' && m.aqua) },
    { id: 'bug', label: 'An insect or bug', w: 2, test: (m) => m.cls === 'bug' },
    { id: 'fly', label: 'Can fly', w: 3, test: (m) => !!m.fly },
    { id: 'aqua', label: 'Lives mostly in the water', w: 3, test: (m) => !!m.aqua },
    { id: 'afr', label: 'Found in the wild in Africa', w: 3, test: (m) => !!m.afr },
    { id: 'legs4', label: 'Walks on four legs', w: 3, test: (m) => !!m.legs4 },
    { id: 'eggs', label: 'Lays eggs', w: 3, test: (m) => !!m.eggs },
    { id: 'big', label: 'Heavier than a grown man', w: 3, test: (m) => !!m.big },
    { id: 'dom', label: 'A pet or farm animal', w: 3, test: (m) => !!m.dom },
    { id: 'hunt', label: 'Hunts other animals', w: 3, test: (m) => !!m.hunt },
    ...letterAttrs(ANIMALS, 'n', (L) => `Name starts with ${L}`, (m) => [m.t]),
  ],
};

const decadeAttrs = (spec) => spec.map(([id, label, lo, hi]) => ({ id, label, w: 3, test: (m) => m.y >= lo && m.y <= hi }));

const U_MOVIES = {
  id: 'movies',
  name: 'Movies',
  noun: 'movie',
  members: MOVIES,
  attrs: [
    ...decadeAttrs([
      ['dec-old', 'Released before 1970', 0, 1969],
      ['dec-70s', 'Released in the 1970s', 1970, 1979],
      ['dec-80s', 'Released in the 1980s', 1980, 1989],
      ['dec-90s', 'Released in the 1990s', 1990, 1999],
      ['dec-00s', 'Released in the 2000s', 2000, 2009],
      ['dec-10s', 'Released in the 2010s', 2010, 2019],
      ['dec-20s', 'Released in the 2020s', 2020, 2029],
    ]),
    { id: 'ani', label: 'An animated movie', w: 3, test: (m) => !!m.ani },
    { id: 'bp', label: 'Won the Best Picture Oscar', w: 3, test: (m) => !!m.bp },
    { id: 'bil', label: 'Made $1 billion at the box office', w: 3, test: (m) => !!m.bil },
    { id: 'r', label: 'Rated R', w: 3, test: (m) => !!m.r },
    { id: 'fr', label: 'Part of a film franchise', w: 3, test: (m) => !!m.fr },
    { id: 'one', label: 'One-word title', w: 2, test: (m) => words(m.t).length === 1 },
    { id: 'num', label: 'A number in the title', w: 2, test: (m) => hasNumber(m.t) },
    ...letterAttrs(MOVIES, 'n', (L) => `Title starts with ${L} ("The" doesn't count)`, (m) => [m.t]),
  ],
};

const U_TV = {
  id: 'tv',
  name: 'TV Shows',
  noun: 'show',
  members: TVSHOWS,
  attrs: [
    ...decadeAttrs([
      ['dec-old', 'Debuted before 1990', 0, 1989],
      ['dec-90s', 'Debuted in the 1990s', 1990, 1999],
      ['dec-00s', 'Debuted in the 2000s', 2000, 2009],
      ['dec-10s', 'Debuted in the 2010s', 2010, 2019],
      ['dec-20s', 'Debuted in the 2020s', 2020, 2029],
    ]),
    { id: 'ani', label: 'Animated', w: 3, test: (m) => !!m.ani },
    { id: 'emmy', label: 'Won the best-series Emmy', w: 3, test: (m) => !!m.emmy },
    { id: 'ten', label: 'Ran ten or more seasons', w: 3, test: (m) => !!m.ten },
    { id: 'str', label: 'A streaming original', w: 3, test: (m) => !!m.str },
    { id: 'nyc', label: 'Set in New York City', w: 3, test: (m) => !!m.nyc },
    { id: 'net', label: 'First aired on ABC, CBS, NBC or Fox', w: 3, test: (m) => !!m.net },
    { id: 'cable', label: 'First aired on a cable channel', w: 3, test: (m) => !!m.cable },
    { id: 'book', label: 'Adapted from a book, comic or video game', w: 2, test: (m) => !!m.book },
    { id: 'the', label: 'Title starts with "The"', w: 2, test: (m) => /^The /.test(m.t) },
    { id: 'one', label: 'One-word title', w: 2, test: (m) => words(strip(m.t)).length === 1 },
    { id: 'num', label: 'A number in the title', w: 2, test: (m) => hasNumber(m.t) },
    ...letterAttrs(TVSHOWS, 'n', (L) => `Title starts with ${L} ("The" doesn't count)`, (m) => [m.t]),
  ],
};

const U_MUSICIANS = {
  id: 'musicians',
  name: 'Musicians',
  noun: 'act',
  members: MUSICIANS,
  attrs: [
    { id: 'band', label: 'A band or group', w: 3, test: (m) => !!m.band },
    { id: 'solo', label: 'A solo act', w: 3, test: (m) => !m.band },
    { id: 'uk', label: 'A British act', w: 3, test: (m) => !!m.uk },
    { id: 'us', label: 'An American act', w: 3, test: (m) => !!m.us },
    { id: 'intl', label: 'Neither an American nor a British act', w: 2, test: (m) => !m.us && !m.uk },
    { id: 'aoty', label: 'Won the Grammy Album of the Year', w: 3, test: (m) => !!m.aoty },
    { id: 'hall', label: 'In the Rock & Roll Hall of Fame', w: 3, test: (m) => !!m.hall },
    { id: 'fem', label: 'A solo female artist', w: 3, test: (m) => !!m.fem },
    { id: 'rap', label: 'A hip-hop or rap act', w: 3, test: (m) => !!m.rap },
    { id: 'ctry', label: 'A country act', w: 2, test: (m) => !!m.ctry },
    { id: 'one', label: 'A one-word name ("The" doesn\'t count)', w: 2, test: (m) => words(strip(m.t)).length === 1 },
    { id: 'num', label: 'A number in the name', w: 2, test: (m) => hasNumber(m.t) },
    ...letterAttrs(MUSICIANS, 'n', (L) => `Name starts with ${L} ("The" doesn't count)`, (m) => [m.t]),
  ],
};

// Home time zone by state or province. Every state and province with a big
// four team sits wholly in one zone for the city that carries the team
// (Nashville and Memphis are both Central, so Tennessee is Central), so the
// map is by state rather than by team. Arizona, Colorado, Utah and Alberta
// are Mountain, which no attribute claims.
const TZ_ET = new Set(['CT', 'DC', 'DE', 'FL', 'GA', 'IN', 'MA', 'MD', 'ME', 'MI', 'NC', 'NH', 'NJ', 'NY', 'OH', 'ON', 'PA', 'QC', 'RI', 'SC', 'VA', 'VT', 'WV']);
const TZ_CT = new Set(['AL', 'AR', 'IA', 'IL', 'KS', 'LA', 'MB', 'MN', 'MO', 'MS', 'ND', 'NE', 'OK', 'SD', 'TN', 'TX', 'WI']);
const TZ_PT = new Set(['BC', 'CA', 'NV', 'OR', 'WA']);

const U_TEAMS = {
  id: 'teams',
  name: 'Pro Sports Teams',
  noun: 'team',
  members: TEAMS,
  attrs: [
    { id: 'lg-nfl', label: 'An NFL team', w: 3, test: (m) => m.lg === 'nfl' },
    { id: 'lg-nba', label: 'An NBA team', w: 3, test: (m) => m.lg === 'nba' },
    { id: 'lg-mlb', label: 'A Major League Baseball team', w: 3, test: (m) => m.lg === 'mlb' },
    { id: 'lg-nhl', label: 'An NHL team', w: 3, test: (m) => m.lg === 'nhl' },
    { id: 'champ', label: 'Won a championship since 2000', w: 3, test: (m) => !!m.champ },
    { id: 'animal', label: 'Named after a creature', w: 3, test: (m) => !!m.animal },
    { id: 'ca', label: 'Based in California', w: 3, test: (m) => m.st === 'CA' },
    { id: 'tx', label: 'Based in Texas', w: 2, test: (m) => m.st === 'TX' },
    { id: 'fl', label: 'Based in Florida', w: 2, test: (m) => m.st === 'FL' },
    { id: 'ny', label: 'A New York team', w: 2, test: (m) => m.st === 'NY' },
    { id: 'can', label: 'Based in Canada', w: 3, test: (m) => !!m.can },
    { id: 'et', label: 'Plays in the Eastern time zone', w: 3, test: (m) => TZ_ET.has(m.st) },
    { id: 'ct', label: 'Plays in the Central time zone', w: 3, test: (m) => TZ_CT.has(m.st) },
    { id: 'pac', label: 'Plays in the Pacific time zone', w: 2, test: (m) => TZ_PT.has(m.st) },
    { id: 'bird', label: 'Named after a bird', w: 2, test: (m) => !!m.bird },
    { id: 'old', label: 'Franchise founded before 1950', w: 3, test: (m) => !!m.old },
    { id: 'nos', label: 'Nickname doesn\'t end in S', w: 2, test: (m) => !/s$/i.test(words(m.t).slice(-1)[0] || '') },
    { id: 'city2', label: 'Two-word place name', w: 2, test: (m) => words(m.t).length >= 3 },
    { id: 'allit', label: 'Alliterative name', w: 2, test: (m) => { const w2 = words(m.t); return w2.length >= 2 && w2[0][0] === w2[w2.length - 1][0]; } },
    ...letterAttrs(TEAMS, 'n', (L) => `Full name starts with ${L}`, (m) => [m.t]),
  ],
};

export const UNIVERSES = [U_COUNTRIES, U_STATES, U_ANIMALS, U_MOVIES, U_TV, U_MUSICIANS, U_TEAMS];
export const UNIVERSE_MAP = Object.fromEntries(UNIVERSES.map((u) => [u.id, u]));

// One universe per ET day of the week, fixed so players learn the rhythm.
// Countries is the Sunday marquee: the deepest universe carries the 4x4.
export const DAY_UNIVERSE = ['countries', 'states', 'animals', 'movies', 'tv', 'teams', 'musicians'];
export function universeForDate(iso) {
  // iso is an ET 'YYYY-MM-DD'; noon UTC of that date has the same weekday.
  const d = new Date(`${iso}T12:00:00Z`);
  return UNIVERSE_MAP[DAY_UNIVERSE[d.getUTCDay()]];
}

export function attrById(universe, id) {
  return universe.attrs.find((a) => a.id === id) || null;
}

// Every member satisfying one attribute (by attr id).
export function validSet(universe, attrId) {
  const a = attrById(universe, attrId);
  if (!a) return [];
  return universe.members.filter((m) => a.test(m));
}

// Every member satisfying BOTH a row and a column attribute — the cell.
export function cellMembers(universe, rowId, colId) {
  const ra = attrById(universe, rowId);
  const ca = attrById(universe, colId);
  if (!ra || !ca) return [];
  return universe.members.filter((m) => ra.test(m) && ca.test(m));
}

// Can the whole board be filled with DISTINCT members? Straight augmenting-path
// bipartite matching, cells on one side, members on the other. Small boards
// (at most 16 cells) so no fancier algorithm is warranted.
export function boardMatchable(universe, rows, cols) {
  const cells = [];
  for (const r of rows) for (const c of cols) cells.push(cellMembers(universe, r, c).map((m) => m.t));
  const match = {}; // member name -> cell index
  const tryCell = (i, seen) => {
    for (const name of cells[i]) {
      if (seen.has(name)) continue;
      seen.add(name);
      if (!(name in match) || tryCell(match[name], seen)) { match[name] = i; return true; }
    }
    return false;
  };
  for (let i = 0; i < cells.length; i++) {
    if (!tryCell(i, new Set())) return false;
  }
  return true;
}

// Type-ahead search over a universe: canonical names plus aliases, prefix and
// word-prefix matches first. Returns member objects, capped.
export function searchMembers(universe, q, cap = 8) {
  const n = normAnswer(q);
  if (!n) return [];
  const starts = [];
  const contains = [];
  for (const m of universe.members) {
    const names = [m.t, ...(m.a || [])].map(normAnswer);
    if (names.some((x) => x.startsWith(n) || x.split(' ').some((wd) => wd.startsWith(n)))) starts.push(m);
    else if (names.some((x) => x.includes(n))) contains.push(m);
  }
  return [...starts, ...contains].slice(0, cap);
}
