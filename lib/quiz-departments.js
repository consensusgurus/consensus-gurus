import {
  Plane, FerrisWheel, Trees, Clapperboard, Music, Gamepad2, BookOpen, Car,
  Youtube, Instagram, GraduationCap, Drama, Trophy, Sparkles, Globe,
  Utensils, Briefcase, Leaf, Tv,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for quiz departments (the category each quiz tile shows).
// Imported by app/quizzes/QuizHomeClient.jsx (index tiles + nav ribbon),
// app/HomeClient.jsx (homepage quiz tiles), and app/quiz/[id]/QuizClient.jsx
// (related-quiz grouping). Do NOT re-introduce per-file copies of this logic.
//
// QUIZ_DEPT is the authoritative id -> department map for every existing quiz.
// quizDept() falls back to id heuristics only for a future quiz not yet listed
// here, and ultimately to 'misc' (label "Miscellaneous", never "Trivia").
// ─────────────────────────────────────────────────────────────────────────────

export const QUIZ_DEPT = {
  'country-trivia-logic-puzzle': 'geography',
  // batches 2-5 (added 2026-06-13)
  'tallest-waterfalls': 'geography',
  'most-time-zones-country': 'geography',
  'highest-capital-cities': 'geography',
  'largest-seas': 'geography',
  'most-abundant-elements-crust': 'science',
  'most-abundant-elements-human-body': 'science',
  'tallest-tree-species': 'science',
  'largest-moons-solar-system': 'science',
  'nearest-stars': 'science',
  'match-invention-to-inventor': 'science',
  'match-discovery-to-scientist': 'science',
  'match-compound-to-formula': 'science',
  'best-picture-by-year': 'movies',
  'oscar-best-director-by-year': 'movies',
  'match-director-to-film': 'movies',
  'match-villain-to-film': 'movies',
  'match-composer-to-film': 'movies',
  'match-actor-to-oscar-role': 'movies',
  'tarantino-films': 'movies',
  'wes-anderson-films': 'movies',
  'coen-brothers-films': 'movies',
  'pixar-films-box-office': 'movies',
  'highest-grossing-horror-films': 'movies',
  'highest-grossing-r-rated-films': 'movies',
  'super-bowl-mvp-by-year': 'sports',
  'nba-finals-mvp-by-year': 'sports',
  'world-series-champion-by-year': 'sports',
  'ballon-dor-by-year': 'sports',
  'f1-champion-by-year': 'sports',
  'uefa-champions-league-by-year': 'sports',
  'match-athlete-to-sport': 'sports',
  'match-nfl-team-to-stadium': 'sports',
  'most-nba-mvp-awards': 'sports',
  'most-pga-tour-wins': 'sports',
  'most-cy-young-awards': 'sports',
  'triple-crown-winners': 'sports',
  'eurovision-winner-by-year': 'music',
  'grammy-album-of-year-by-year': 'music',
  'most-translated-books': 'literature',
  'longest-novels': 'literature',
  'match-album-to-band': 'music',
  'match-band-to-lead-singer': 'music',
  'match-author-to-pen-name': 'literature',
  'match-detective-to-author': 'literature',
  'match-dystopian-novel-to-author': 'literature',
  'match-poem-to-poet': 'literature',
  'match-dish-to-country': 'food',
  'match-cocktail-to-spirit': 'food',
  // batch1 geography & science (added 2026-06-13)
  'smallest-countries-by-area': 'geography',
  'least-populated-countries': 'geography',
  'eurozone-countries': 'geography',
  'landlocked-countries': 'geography',
  'us-state-capitals': 'geography',
  'largest-urban-areas': 'geography',
  'largest-lakes-by-area': 'geography',
  'most-land-borders-countries': 'geography',
  'match-country-to-currency': 'geography',
  'largest-solar-system-objects': 'science',
  'most-abundant-elements-universe': 'science',
  'brightest-stars': 'science',
  'deepest-ocean-trenches': 'science',
  'match-element-to-symbol': 'science',
  // movies (44)
  'top-grossing-films-1990': 'movies',
  'top-grossing-films-1970s': 'movies',
  'top-grossing-films-1980s': 'movies',
  'top-grossing-films-1990s': 'movies',
  'top-grossing-films-2000s': 'movies',
  'top-grossing-films-2010s': 'movies',
  'top-grossing-films-inflation-adjusted': 'movies',
  'top-grossing-animated-films': 'movies',
  'most-expensive-movies': 'movies',
  'top-grossing-film-franchises': 'movies',
  'top-grossing-actors': 'movies',
  'top-grossing-directors': 'movies',
  'highest-grossing-directors': 'movies',
  'movies-david-fincher': 'movies',
  'john-hughes-movies': 'movies',
  'kubrick-movies': 'movies',
  'nolan-movies': 'movies',
  'spielberg-movies': 'movies',
  'bigelow-movies': 'movies',
  'scorsese-movies': 'movies',
  'hitchcock-movies': 'movies',
  'highest-grossing-films-all-time': 'movies',
  'highest-grossing-superhero-films': 'movies',
  'movie-quotes-to-movies': 'movies',
  'top-grossing-tom-hanks-movies': 'movies',
  'top-grossing-tom-cruise-movies': 'movies',
  'top-grossing-will-smith-movies': 'movies',
  'top-grossing-eddie-murphy-movies': 'movies',
  'top-grossing-robert-de-niro-movies': 'movies',
  'top-grossing-al-pacino-movies': 'movies',
  'top-grossing-dustin-hoffman-movies': 'movies',
  'top-grossing-denzel-washington-movies': 'movies',
  'top-grossing-robin-williams-movies': 'movies',
  'top-grossing-morgan-freeman-movies': 'movies',
  'top-grossing-jeff-bridges-movies': 'movies',
  'top-grossing-leonardo-dicaprio-movies': 'movies',
  'top-grossing-russell-crowe-movies': 'movies',
  'top-grossing-kevin-spacey-movies': 'movies',
  'top-grossing-joe-pesci-movies': 'movies',
  'top-grossing-arnold-schwarzenegger-movies': 'movies',
  'top-grossing-chris-pratt-movies': 'movies',
  'movie-taglines': 'movies',
  'movie-taglines-2': 'movies',
  'most-oscar-wins-individual': 'movies',

  // sports (47)
  'world-cup-winners': 'sports',
  'super-bowl-champions': 'sports',
  'nba-champions': 'sports',
  'best-nfl-teams': 'sports',
  'best-nba-teams': 'sports',
  'best-mlb-teams': 'sports',
  'nfl-total-touchdowns-leaders': 'sports',
  'nfl-receiving-touchdowns-leaders': 'sports',
  'nfl-rushing-touchdowns-leaders': 'sports',
  'nba-scoring-leaders': 'sports',
  'nhl-scoring-leaders': 'sports',
  'mlb-runs-scored-leaders': 'sports',
  'mlb-rbi-leaders': 'sports',
  'nfl-passing-yards-leaders': 'sports',
  'nfl-rushing-yards-leaders': 'sports',
  'nfl-receiving-yards-leaders': 'sports',
  'nfl-sack-leaders': 'sports',
  'nfl-interception-leaders': 'sports',
  'nba-assists-leaders': 'sports',
  'nba-rebounds-leaders': 'sports',
  'nba-steals-leaders': 'sports',
  'nba-blocks-leaders': 'sports',
  'nba-three-pointers-leaders': 'sports',
  'mlb-home-run-leaders': 'sports',
  'mlb-stolen-base-leaders': 'sports',
  'mlb-strikeout-leaders-pitching': 'sports',
  'mens-tennis-grand-slam-leaders': 'sports',
  'womens-tennis-grand-slam-leaders': 'sports',
  'olympic-gold-medal-leaders': 'sports',
  'nfl-super-bowl-wins-by-franchise': 'sports',
  'nba-championships-by-franchise': 'sports',
  'mlb-world-series-wins-by-franchise': 'sports',
  'nhl-stanley-cup-wins-by-franchise': 'sports',
  'fifa-world-cup-wins-by-country': 'sports',
  'olympic-gold-medals-by-country': 'sports',
  'college-football-champions': 'sports',
  'mens-college-basketball-champions': 'sports',
  'stanley-cup-champions': 'sports',
  'world-series-champions': 'sports',
  'best-college-football-teams': 'sports',
  'best-college-basketball-teams': 'sports',
  'loudest-college-football-stadiums': 'sports',
  'golf-major-championships-leaders': 'sports',
  'f1-most-race-wins': 'sports',
  'f1-most-championships': 'sports',
  'ncaa-basketball-scoring-leaders': 'sports',
  'international-soccer-goals-leaders': 'sports',

  // music (15)
  'top-songs-1960s': 'music',
  'top-songs-1970s': 'music',
  'top-songs-1980s': 'music',
  'top-songs-1990s': 'music',
  'top-songs-2000s': 'music',
  'top-songs-2010s': 'music',
  'most-weeks-billboard-hot-100': 'music',
  'best-selling-singles': 'music',
  'most-streamed-spotify-songs': 'music',
  'most-viewed-music-videos': 'music',
  'top-grossing-concert-tours': 'music',
  'best-selling-albums-all-time': 'music',
  'best-selling-soundtracks-all-time': 'music',
  'most-number-one-singles-billboard': 'music',
  'best-selling-music-artists': 'music',

  // gaming (7)
  'highest-grossing-video-games': 'gaming',
  'highest-grossing-console-video-games': 'gaming',
  'best-selling-games-all-time': 'gaming',
  'mario-quest-games': 'gaming',
  'best-selling-pc-games': 'gaming',
  'best-selling-game-franchises': 'gaming',
  'best-selling-game-consoles': 'gaming',

  // travel (10)
  'most-visited-theme-parks': 'travel',
  'most-visited-us-national-parks': 'travel',
  'busiest-airports-world': 'travel',
  'busiest-airports-us': 'travel',
  'busiest-airports-outside-us': 'travel',
  'best-airlines-north-america': 'travel',
  'best-airlines-world': 'travel',
  'best-beaches-us': 'travel',
  'college-towns-america': 'travel',
  'most-visited-countries': 'travel',

  // geography (28)
  'countries-of-europe': 'geography',
  'countries-of-north-america': 'geography',
  'countries-of-south-america': 'geography',
  'countries-of-africa': 'geography',
  'countries-of-asia': 'geography',
  'capitals-of-europe': 'geography',
  'capitals-of-asia': 'geography',
  'capitals-of-africa': 'geography',
  'capitals-of-north-america': 'geography',
  'capitals-of-south-america': 'geography',
  'capitals-of-oceania': 'geography',
  'countries-by-population': 'geography',
  'largest-countries-by-area': 'geography',
  'countries-by-gdp': 'geography',
  'countries-most-unesco-sites': 'geography',
  'countries-longest-coastlines': 'geography',
  'tallest-mountains-world': 'geography',
  'longest-rivers-world': 'geography',
  'largest-deserts-world': 'geography',
  'largest-islands-world': 'geography',
  'deepest-lakes-world': 'geography',
  'seven-summits': 'geography',
  'most-populated-us-cities': 'geography',
  'us-states-by-population': 'geography',
  'us-states-by-area': 'geography',
  'longest-us-interstate-highways': 'geography',
  'tallest-buildings-us': 'geography',
  'tallest-buildings-world': 'geography',

  // literature (7)
  'best-selling-books': 'literature',
  'best-selling-book-series': 'literature',
  'spy-novels': 'literature',
  'best-selling-fiction-authors': 'literature',
  'novels-to-authors': 'literature',
  'opening-lines': 'literature',
  'opening-lines-2': 'literature',

  // entertainment (5)
  'most-subscribed-youtube-channels': 'entertainment',
  'most-followed-instagram-accounts': 'entertainment',
  'top-grossing-broadway-shows': 'entertainment',
  'standup-specials-netflix': 'entertainment',
  'most-emmy-wins-single-show': 'entertainment',

  // food (8)
  'girl-scout-cookies': 'food',
  'best-classic-chips': 'food',
  'best-sandwich-types': 'food',
  'best-chain-pizza-restaurants': 'food',
  'best-sub-chains': 'food',
  'taco-bell-menu-items': 'food',
  'mcdonalds-menu-items': 'food',
  'largest-restaurant-chains-store-count': 'food',

  // business (5)
  'best-selling-cars-all-time': 'business',
  'largest-university-endowments': 'business',
  'company-slogans': 'business',
  'companies-to-headquarters': 'business',
  'weekly-business-quiz-2026-06-12': 'business',

  // science (6)
  'fastest-animals-earth': 'science',
  'heaviest-animals-earth': 'science',
  'heaviest-land-animals': 'science',
  'longest-living-animals': 'science',
  'most-spoken-languages-native': 'science',
  'most-spoken-languages-total': 'science',
};

export function quizDept(q) {
  if (!q) return 'misc';
  if (QUIZ_DEPT[q.id]) return QUIZ_DEPT[q.id];
  const id = q.id || '';
  if (q.format === 'map') return 'geography';
  if (/sports?|nfl|nba|mlb|nhl|fifa|olympic|super-bowl|world-cup|athlete|grand-slam|soccer|golf|tennis|\bf1\b|f1-|college-football|college-basketball|ncaa|stanley-cup|world-series/.test(id)) return 'sports';
  if (q.type === 'travel') return 'travel';
  if (/film|movie|box-office|director|actor|animated|oscar/.test(id)) return 'movies';
  if (/games|video-games|game-console|game-franchise/.test(id)) return 'gaming';
  if (/song|album|single|spotify|music-video|concert-tour|billboard|soundtrack|music-artist/.test(id)) return 'music';
  if (/book|novel|author|opening-lines/.test(id)) return 'literature';
  if (/youtube|instagram|broadway|emmy|netflix|standup/.test(id)) return 'entertainment';
  if (/cookie|chips|sandwich|pizza|sub-chain|menu-item|restaurant-chain|\bfood\b/.test(id)) return 'food';
  if (/\bcars?\b|endowment|compan|slogan|brand|business/.test(id)) return 'business';
  if (/animal|language/.test(id)) return 'science';
  if (q.type === 'other') return 'geography';
  return 'misc';
}

// Per-department display label (the badge text on each tile).
export const DEPT_LABEL = {
  movies: 'Movies',
  music: 'Music',
  gaming: 'Gaming',
  travel: 'Travel',
  sports: 'Sports',
  geography: 'Geography',
  food: 'Food & Drink',
  business: 'Business',
  science: 'Science & Nature',
  entertainment: 'Entertainment',
  literature: 'Literature',
  misc: 'Miscellaneous',
};

// Accent color + light medallion tint per department.
export const DEPT_COLOR = {
  movies:        { c: '#c0392b', t: '#f3ddd8' },
  music:         { c: '#c98a1b', t: '#f3e3c8' },
  gaming:        { c: '#7a4fb0', t: '#e6dcf1' },
  travel:        { c: '#2e7d6b', t: '#d5e8e1' },
  sports:        { c: '#2f6f9f', t: '#d9e6f0' },
  geography:     { c: '#1f7a8c', t: '#d4e9ee' },
  food:          { c: '#c2691c', t: '#f4e2cd' },
  business:      { c: '#4d6b8a', t: '#dbe4ee' },
  science:       { c: '#3f8c5a', t: '#d9ecdf' },
  entertainment: { c: '#b0466e', t: '#f3dce4' },
  literature:    { c: '#8a6d3b', t: '#ece2cf' },
  misc:          { c: '#4f7d5a', t: '#dde8df' },
};

// Default icon per department (used unless a finer per-quiz override applies).
const DEPT_ICON = {
  movies: Clapperboard,
  music: Music,
  gaming: Gamepad2,
  travel: Plane,
  sports: Trophy,
  geography: Globe,
  food: Utensils,
  business: Briefcase,
  science: Leaf,
  entertainment: Tv,
  literature: BookOpen,
  misc: Sparkles,
};

export function quizIcon(q) {
  const id = (q && q.id) || '';
  if (q && q.format === 'map') return Globe;
  if (/airline/.test(id)) return Plane;
  if (/theme-park/.test(id)) return FerrisWheel;
  if (/national-park/.test(id)) return Trees;
  if (/best-selling-cars/.test(id)) return Car;
  if (/youtube/.test(id)) return Youtube;
  if (/instagram/.test(id)) return Instagram;
  if (/endowment|universit/.test(id)) return GraduationCap;
  if (/broadway/.test(id)) return Drama;
  return DEPT_ICON[quizDept(q)] || Sparkles;
}

// Department nav entries (id + label). The ribbon orders these live by how many
// quizzes each holds (most quizzes leftmost); see QuizHomeClient.
export const DEPT_NAV = [
  { id: 'movies', label: 'Movies' },
  { id: 'music', label: 'Music' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'travel', label: 'Travel' },
  { id: 'sports', label: 'Sports' },
  { id: 'geography', label: 'Geography' },
  { id: 'food', label: 'Food & Drink' },
  { id: 'business', label: 'Business' },
  { id: 'science', label: 'Science & Nature' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'literature', label: 'Literature' },
];
