// Puzzle data for the daily game. Imported ONLY by the server page
// component, which filters to live<=today before passing puzzles to
// the client — so future puzzles (and their pars/routes) never ship to the
// browser bundle.
//
// par = BFS-minimum border hops on app/span/borders.js — recompute with the
// validator after ANY borders change; a stale par breaks scoring. `note` is
// revealed at game end (a fun fact about the route, never a spoiler before).
//
// SUNDAY EDITIONS (every Sunday, starting 2026-07-19): one twist per Sunday,
// either `via: '<Country>'` (the chain must pass through it before reaching
// the destination) or `avoid: '<Country>'` (that country is closed and can't
// be entered). Set `sunday: true` alongside. RULES FOR AUTHORING:
// - par MUST be the CONSTRAINED shortest: for avoid, BFS with the country
//   blocked (the destination must stay reachable!); for via, hops(start,via)
//   + hops(via,end), which the validator also proves is achievable as a
//   simple path (the two legs must compose without reusing a country).
// - Never both via and avoid on one puzzle. Weekday puzzles get neither.
// - Pick twists that genuinely reroute the road (base par should change).
export const PUZZLES = [
  {
    num: 1,
    quizId: 'span-7-12-26',
    live: '2026-07-12',
    dateLabel: 'July 12, 2026',
    start: 'Canada',
    end: 'Panama',
    par: 7,
    note: 'The full mainland run: there is exactly one shortest road, and no country on it can be skipped.',
  },
  {
    num: 2,
    quizId: 'span-7-13-26',
    live: '2026-07-13',
    dateLabel: 'July 13, 2026',
    start: 'Finland',
    end: 'Greece',
    par: 4,
    note: 'Both shortest roads leave Europe: Russia opens the door, and Turkey or the Caucasus closes it.',
  },
  {
    num: 3,
    quizId: 'span-7-14-26',
    live: '2026-07-14',
    dateLabel: 'July 14, 2026',
    start: 'Argentina',
    end: 'Ecuador',
    par: 3,
    note: 'Brazil borders every South American country except Ecuador and Chile — which is exactly why it is the perfect middle step.',
  },
  {
    num: 4,
    quizId: 'span-7-15-26',
    live: '2026-07-15',
    dateLabel: 'July 15, 2026',
    start: 'Senegal',
    end: 'Egypt',
    par: 4,
    note: 'The Sahara is a highway here: Algeria and Libya between them touch almost everything across North Africa.',
  },
  {
    num: 5,
    quizId: 'span-7-16-26',
    live: '2026-07-16',
    dateLabel: 'July 16, 2026',
    start: 'Norway',
    end: 'South Korea',
    par: 3,
    note: 'Russia borders both Norway and North Korea — one country spans the whole of Eurasia.',
  },
  {
    num: 6,
    quizId: 'span-7-17-26',
    live: '2026-07-17',
    dateLabel: 'July 17, 2026',
    start: 'Oman',
    end: 'Tunisia',
    par: 6,
    note: 'The one shortest road runs Jordan → Israel → Egypt: the Sinai crossing is the only land door between Asia and Africa.',
  },
  {
    num: 7,
    quizId: 'span-7-18-26',
    live: '2026-07-18',
    dateLabel: 'July 18, 2026',
    start: 'Mexico',
    end: 'Chile',
    par: 8,
    note: 'Eight hops, one road: Central America is a single-file line, and only Peru and Bolivia touch Chile at the far end.',
  },
  {
    num: 8,
    quizId: 'span-7-19-26',
    live: '2026-07-19',
    dateLabel: 'July 19, 2026',
    start: 'Sweden',
    end: 'Switzerland',
    sunday: true,
    via: 'Italy',
    par: 7, // hops(Sweden,Italy)=6 + hops(Italy,Switzerland)=1, legs disjoint
    note: 'Without the detour this is a 5-hop road. Italy drags you the long way around: out through Russia, across Poland and Germany, down through France, and into Switzerland from the south.',
  },
  {
    num: 9,
    quizId: 'span-7-20-26',
    live: '2026-07-20',
    dateLabel: 'July 20, 2026',
    start: 'Thailand',
    end: 'Georgia',
    par: 4,
    note: 'China and Russia stitched together bridge Southeast Asia to the Caucasus in just two giant steps.',
  },
  {
    num: 10,
    quizId: 'span-7-21-26',
    live: '2026-07-21',
    dateLabel: 'July 21, 2026',
    start: 'South Africa',
    end: 'Nigeria',
    par: 5,
    note: 'The Atlantic coast is the fast lane — Angola reaches the Republic of the Congo through Cabinda, its exclave north of the DRC.',
  },
  {
    num: 11,
    quizId: 'span-7-22-26',
    live: '2026-07-22',
    dateLabel: 'July 22, 2026',
    start: 'Timor-Leste',
    end: 'Bangladesh',
    par: 5,
    note: 'Indonesia and Malaysia share a land border on Borneo — the island route quietly connects to mainland Asia.',
  },
  {
    num: 12,
    quizId: 'span-7-23-26',
    live: '2026-07-23',
    dateLabel: 'July 23, 2026',
    start: 'Estonia',
    end: 'Portugal',
    par: 6,
    note: 'The Baltic chain through Latvia and Lithuania is one hop longer — the single shortest road leaves through Russia and Kaliningrad is not needed at all.',
  },
  {
    num: 13,
    quizId: 'span-7-24-26',
    live: '2026-07-24',
    dateLabel: 'July 24, 2026',
    start: 'Ghana',
    end: 'Ethiopia',
    par: 5,
    note: 'Both shortest roads cross the Sahara — the coast route through Nigeria and Cameroon is the scenic detour.',
  },
  {
    num: 14,
    quizId: 'span-7-25-26',
    live: '2026-07-25',
    dateLabel: 'July 25, 2026',
    start: 'Spain',
    end: 'India',
    par: 6,
    note: 'The one shortest road runs through Russia and China — the southern route through Iran costs an extra hop.',
  },
  {
    num: 15,
    quizId: 'span-7-26-26',
    live: '2026-07-26',
    dateLabel: 'July 26, 2026',
    start: 'Germany',
    end: 'China',
    sunday: true,
    avoid: 'Russia',
    par: 8, // base par is 3 (Poland–Russia–China); with Russia closed the road is the old Silk Road
    note: 'With Russia open this is three hops. Closed, the only way east is the old Silk Road: down the Balkans, through Turkey and Iran, and over the mountains into China.',
  },
];
