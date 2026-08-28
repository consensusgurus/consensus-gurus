// Canonical team registry + alias normalizer.
//
// Every source names teams differently. Sagarin says "Miami-Florida" and still
// says "Washington Redskins"; DRatings appends mascots; CBS prints nicknames
// only; nfelo uses abbreviations and still calls the Raiders "OAK". Nothing
// downstream works until they all resolve to one canonical name, so this table
// is the join key for the whole framework.
//
// `id` is the ESPN team id (CFB logos key off the id), `abbr` the ESPN
// lowercase abbreviation (NFL logos key off the abbreviation). Every id below
// was read off a live ESPN response — never guess one, a wrong id silently
// renders another team's logo.

export const CFB_TEAMS = {
  'Ohio State':      { id: 194,  aliases: [] },
  'Oregon':          { id: 2483, aliases: [] },
  'Notre Dame':      { id: 87,   aliases: [] },
  'Georgia':         { id: 61,   aliases: [] },
  'Texas':           { id: 251,  aliases: [] },
  'Indiana':         { id: 84,   aliases: [] },
  'Miami':           { id: 2390, aliases: ['Miami-Florida', 'Miami (FL)', 'Miami FL'] },
  'Texas A&M':       { id: 245,  aliases: [] },
  'Oklahoma':        { id: 201,  aliases: [] },
  'LSU':             { id: 99,   aliases: ['Louisiana State'] },
  'Ole Miss':        { id: 145,  aliases: ['Mississippi'] },
  'Texas Tech':      { id: 2641, aliases: [] },
  'Alabama':         { id: 333,  aliases: [] },
  'USC':             { id: 30,   aliases: ['Southern California', 'Southern Cal'] },
  'BYU':             { id: 252,  aliases: ['Brigham Young'] },
  'Michigan':        { id: 130,  aliases: [] },
  'Washington':      { id: 264,  aliases: [] },
  'Penn State':      { id: 213,  aliases: [] },
  'SMU':             { id: 2567, aliases: ['Southern Methodist'] },
  'Tennessee':       { id: 2633, aliases: [] },
  'Utah':            { id: 254,  aliases: [] },
  'Iowa':            { id: 2294, aliases: [] },
  'Houston':         { id: 248,  aliases: [] },
  'Louisville':      { id: 97,   aliases: [] },
  'Missouri':        { id: 142,  aliases: [] },
  'Clemson':         { id: 228,  aliases: [] },
  'Florida':         { id: 57,   aliases: [] },
  'Auburn':          { id: 2,    aliases: [] },
  'South Carolina':  { id: 2579, aliases: [] },
  'Vanderbilt':      { id: 238,  aliases: [] },
  // --- added for the top 50 ---
  'Wisconsin':       { id: 275,  aliases: [] },
  'Illinois':        { id: 356,  aliases: [] },
  'Nebraska':        { id: 158,  aliases: [] },
  'Kentucky':        { id: 96,   aliases: [] },
  'Minnesota':       { id: 135,  aliases: [] },
  'UCLA':            { id: 26,   aliases: [] },
  'Pittsburgh':      { id: 221,  aliases: ['Pitt'] },
  'Mississippi State': { id: 344, aliases: [] },
  'Kansas State':    { id: 2306, aliases: [] },
  'Florida State':   { id: 52,   aliases: [] },
  'Arizona':         { id: 12,   aliases: [] },
  'Virginia Tech':   { id: 259,  aliases: [] },
  'Northwestern':    { id: 77,   aliases: [] },
  'Virginia':        { id: 258,  aliases: [] },
  'Arizona State':   { id: 9,    aliases: [] },
  'TCU':             { id: 2628, aliases: ['Texas Christian'] },
  'Georgia Tech':    { id: 59,   aliases: [] },
  'Arkansas':        { id: 8,    aliases: [] },
  'NC State':        { id: 152,  aliases: ['North Carolina State'] },
  'Baylor':          { id: 239,  aliases: [] },
  'Kansas':          { id: 2305, aliases: [] },
  'Duke':            { id: 150,  aliases: [] },
  'Boise State':     { id: 68,   aliases: [] },
  'Iowa State':      { id: 66,   aliases: [] },
  'Wake Forest':     { id: 154,  aliases: [] },
  'California':      { id: 25,   aliases: ['Cal'] },
  'Tulane':          { id: 2655, aliases: [] },
  'UNLV':            { id: 2439, aliases: ['Nevada-Las Vegas'] },
  'North Carolina':  { id: 153,  aliases: [] },
  'Colorado':        { id: 38,   aliases: [] },
  'Cincinnati':      { id: 2132, aliases: [] },
  'Oklahoma State':  { id: 197,  aliases: [] },
  'UCF':             { id: 2116, aliases: ['Central Florida'] },
  'San Diego State': { id: 21,   aliases: [] },
  'Memphis':         { id: 235,  aliases: [] },
  'James Madison':   { id: 256,  aliases: [] },
  'Navy':            { id: 2426, aliases: [] },
  'New Mexico':      { id: 167,  aliases: [] },
  'Western Michigan':{ id: 2711, aliases: [] },
  'Liberty':         { id: 2335, aliases: [] },
  'Louisiana':       { id: 309,  aliases: ['Louisiana-Lafayette', 'UL Lafayette'] },
  "Hawai'i":         { id: 62,   aliases: ['Hawaii'] },
  'Jacksonville State': { id: 55, aliases: [] },
};

export const NFL_TEAMS = {
  'Arizona Cardinals':     { abbr: 'ari' }, 'Atlanta Falcons':      { abbr: 'atl' },
  'Baltimore Ravens':      { abbr: 'bal' }, 'Buffalo Bills':        { abbr: 'buf' },
  'Carolina Panthers':     { abbr: 'car' }, 'Chicago Bears':        { abbr: 'chi' },
  'Cincinnati Bengals':    { abbr: 'cin' }, 'Cleveland Browns':     { abbr: 'cle' },
  'Dallas Cowboys':        { abbr: 'dal' }, 'Denver Broncos':       { abbr: 'den' },
  'Detroit Lions':         { abbr: 'det' }, 'Green Bay Packers':    { abbr: 'gb'  },
  'Houston Texans':        { abbr: 'hou' }, 'Indianapolis Colts':   { abbr: 'ind' },
  'Jacksonville Jaguars':  { abbr: 'jax' }, 'Kansas City Chiefs':   { abbr: 'kc'  },
  // nfelo still emits the pre-2020 OAK for the Raiders.
  'Las Vegas Raiders':     { abbr: 'lv',  aliases: ['OAK', 'Oakland Raiders'] },
  'Los Angeles Chargers':  { abbr: 'lac' }, 'Los Angeles Rams':     { abbr: 'lar' },
  'Miami Dolphins':        { abbr: 'mia' }, 'Minnesota Vikings':    { abbr: 'min' },
  'New England Patriots':  { abbr: 'ne'  }, 'New Orleans Saints':   { abbr: 'no'  },
  'New York Giants':       { abbr: 'nyg' }, 'New York Jets':        { abbr: 'nyj' },
  'Philadelphia Eagles':   { abbr: 'phi' }, 'Pittsburgh Steelers':  { abbr: 'pit' },
  'San Francisco 49ers':   { abbr: 'sf'  }, 'Seattle Seahawks':     { abbr: 'sea' },
  'Tampa Bay Buccaneers':  { abbr: 'tb'  }, 'Tennessee Titans':     { abbr: 'ten' },
  // Sagarin still prints the retired name; nfelo uses WAS, ESPN uses WSH.
  'Washington Commanders': { abbr: 'wsh', aliases: ['WAS', 'Washington Redskins', 'Washington Football Team'] },
};

export function logoFor(sport, canonical) {
  if (sport === 'nfl') {
    const t = NFL_TEAMS[canonical];
    return t ? `https://a.espncdn.com/i/teamlogos/nfl/500/${t.abbr}.png` : null;
  }
  const t = CFB_TEAMS[canonical];
  return t && t.id ? `https://a.espncdn.com/i/teamlogos/ncaa/500/${t.id}.png` : null;
}

// What stands in when the logo cannot load (a 404, or a host that blocks
// external images). NFL uses the real ESPN abbreviation; CFB falls back to
// initials, since ESPN's CFB abbreviations are not in this table.
export function monoFor(sport, canonical) {
  if (sport === 'nfl') {
    const t = NFL_TEAMS[canonical];
    if (t) return t.abbr.toUpperCase();
  }
  const words = canonical.split(' ').filter((w) => w !== '&');
  return (words.length === 1 ? words[0].slice(0, 3) : words.map((w) => w[0]).join(''))
    .slice(0, 4).toUpperCase();
}

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9&]+/g, ' ').trim();

function buildIndex(table, sport) {
  const ix = new Map();
  const add = (k, v) => { const n = norm(k); if (n && !ix.has(n)) ix.set(n, v); };
  for (const [canon, meta] of Object.entries(table)) {
    add(canon, canon);
    for (const a of meta.aliases || []) add(a, canon);
    if (sport === 'nfl') {
      // Media outlets print nicknames only ("Seahawks") and models print
      // abbreviations ("LAR"). Every NFL nickname is a single trailing token
      // and unique league-wide, so both forms are unambiguous.
      add(canon.split(' ').pop(), canon);
      add(meta.abbr, canon);
    }
  }
  return ix;
}
const IX = { cfb: buildIndex(CFB_TEAMS, 'cfb'), nfl: buildIndex(NFL_TEAMS, 'nfl') };

// Resolve a source's team string to the canonical name.
// Returns null when it cannot be resolved — the caller must treat that as a
// hard parse failure, never silently drop the row, or a source quietly loses
// teams and every rank beneath the missing one shifts up by one.
export function resolveTeam(sport, raw) {
  const ix = IX[sport];
  const n = norm(raw);
  if (ix.has(n)) return ix.get(n);
  // DRatings appends the mascot ("Ohio State Buckeyes"). Try progressively
  // shorter prefixes, longest first, so "Kansas State Wildcats" resolves to
  // Kansas State rather than Kansas.
  const words = n.split(' ');
  for (let take = words.length - 1; take >= 1; take--) {
    const p = words.slice(0, take).join(' ');
    if (ix.has(p)) return ix.get(p);
  }
  return null;
}
