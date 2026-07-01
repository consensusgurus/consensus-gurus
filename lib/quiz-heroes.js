// Per-quiz hero image registry: the single source of truth for which quizzes
// carry a hero photo. Drives all three featured slots on the quiz hub
// (app/quizzes/QuizHomeClient.jsx):
//   * Category card   = the most-PLAYED quiz in that category that has a hero here
//                       (so it follows plays but never hands off to a heroless quiz).
//   * Newest tile     = the newest quiz; its registry hero is preferred, and it
//                       falls back to a department photo so it is never blank.
//   * Quiz of the Day = auto-rotates each Eastern midnight over QOTD_POOL, with
//                       per-date pins in QOTD_OVERRIDES. Only heroed quizzes are
//                       eligible, so the QOTD banner always has a real photo.
// A featured slot only ever shows a quiz listed here, so no slot is ever heroless.
// Every `src` must be a JPEG or PNG (never WebP/AVIF) and should verify live
// through the site image optimizer (/_next/image -> image/jpeg). `pos` is an
// optional CSS background-position for portrait/off-center crops.

export const QUIZ_HEROES = {
  'mlb-career-history':                     { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Shohei_Ohtani_vs_Orioles_2022.jpg/1280px-Shohei_Ohtani_vs_Orioles_2022.jpg', pos: 'center 20%' },
  'nba-career-history':                     { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/LeBron_James_dribbling_%28March_21%2C_2022%29.jpg/1280px-LeBron_James_dribbling_%28March_21%2C_2022%29.jpg', pos: 'center 20%' },
  'nfl-career-history':                     { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Tom_Brady_WFT-Buccaneers_NOV2021.jpg/1280px-Tom_Brady_WFT-Buccaneers_NOV2021.jpg', pos: 'center 20%' },
  'name-the-movie-from-poster':             { src: 'https://image.tmdb.org/t/p/w780/AmyQTQsNxITitCM0Ya5l5bpYGpn.jpg', pos: 'center 32%' },
  'match-rapper-hometown':                  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/50_cent_en_concierto.jpg/1280px-50_cent_en_concierto.jpg' },
  'gaming-pokemon-to-type':                 { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/SNES-Controller-in-Hand.jpg/1280px-SNES-Controller-in-Hand.jpg' },
  'name-the-ski-resort-from-the-trail-map': { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Skiers_at_SkiWelt_Wilder_Kaiser-Brixental_Austrian_Alps_2026.JPG/1280px-Skiers_at_SkiWelt_Wilder_Kaiser-Brixental_Austrian_Alps_2026.JPG' },
  'world-cup-winners':                      { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Stadium_of_Football_Club_FC_Barcelona_-_Camp_Nou.jpg/1280px-Stadium_of_Football_Club_FC_Barcelona_-_Camp_Nou.jpg' },
  'europe-no-outline':                      { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Europe_%28MODIS_2017-04-22%29.jpg/1280px-Europe_%28MODIS_2017-04-22%29.jpg' },
  'nyc-restaurant-geo-guesser':             { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Katz%27s_Delicatessen_%2851623899326%29.jpg/1280px-Katz%27s_Delicatessen_%2851623899326%29.jpg' },
  'company-slogans':                        { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1280px-New_york_times_square-terabass.jpg' },
  'match-element-to-symbol':                { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/%C3%80t%E1%BA%B9_%C3%88r%C3%B2j%C3%A0_Al%C3%A1%C3%ACl%C3%A1b%C3%B9l%C3%A0_%28Yoruba_Periodic_Table_of_the_Elements%29.jpg/1280px-%C3%80t%E1%BA%B9_%C3%88r%C3%B2j%C3%A0_Al%C3%A1%C3%ACl%C3%A1b%C3%B9l%C3%A0_%28Yoruba_Periodic_Table_of_the_Elements%29.jpg' },
  'match-the-succession-character':         { src: 'https://upload.wikimedia.org/wikipedia/commons/0/06/Brian_Cox_Edinburgh_2025.jpg', pos: 'center 20%' },
  'opening-lines':                          { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bibliotheca_Bodleiana.jpg/1280px-Bibliotheca_Bodleiana.jpg' },
  'match-empire-to-capital':                { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg' },
  'name-the-painting':                      { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/1280px-Louvre_Museum_Wikimedia_Commons.jpg' },
  'name-the-state-from-its-quarter':        { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2022_Washington_quarter_obverse.jpeg/1280px-2022_Washington_quarter_obverse.jpeg' },
  'los-angeles-landmarks-geo-guesser':      { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Skyline_of_Los_Angeles%2C_Downtown_Los_Angeles%2C_California_13.jpg/1280px-Skyline_of_Los_Angeles%2C_Downtown_Los_Angeles%2C_California_13.jpg' },
  'london-landmarks-geo-guesser-pt-1':      { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/London_Thames_Sunset_panorama_-_Feb_2008.jpg/1280px-London_Thames_Sunset_panorama_-_Feb_2008.jpg' },
  'paris-landmarks-geo-guesser-pt-1':       { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Paris_pano_%40_Cit%C3%A9_de_l%27Architecture_et_du_Patrimoine_roof.jpg/1280px-Paris_pano_%40_Cit%C3%A9_de_l%27Architecture_et_du_Patrimoine_roof.jpg' },
  'f1-circuit-from-a-photo':                { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/2005_Monaco_GP2%2C_Monaco_Grand_Prix_Support_Race%2C_Monte_Carlo%2C_21st_May.jpg/1280px-2005_Monaco_GP2%2C_Monaco_Grand_Prix_Support_Race%2C_Monte_Carlo%2C_21st_May.jpg' },
};

export function heroFor(id) { return (id && QUIZ_HEROES[id]) || null; }

// ---- Quiz of the Day rotation ----------------------------------------------
// Per-date pins win; every other Eastern day auto-rotates over QOTD_POOL. To
// feature a specific quiz on a specific day, add a pin here (the quiz MUST be in
// QUIZ_HEROES). Dates are Eastern YYYY-MM-DD; the flip happens at ET midnight.
export const QOTD_OVERRIDES = {
  '2026-07-01': 'f1-circuit-from-a-photo',                 // today, unchanged
  '2026-07-02': 'f1-circuit-from-a-photo',                 // tonight's ET midnight: hold (ski resort is NOT tonight)
  '2026-07-03': 'name-the-ski-resort-from-the-trail-map',  // tomorrow night's ET midnight: ski resort trail map
};

// Heroed quizzes eligible to auto-rotate as Quiz of the Day, cycled by day index.
export const QOTD_POOL = [
  'f1-circuit-from-a-photo',
  'name-the-ski-resort-from-the-trail-map',
  'nyc-restaurant-geo-guesser',
  'los-angeles-landmarks-geo-guesser',
  'london-landmarks-geo-guesser-pt-1',
  'paris-landmarks-geo-guesser-pt-1',
  'name-the-movie-from-poster',
  'match-the-succession-character',
  'match-rapper-hometown',
  'gaming-pokemon-to-type',
  'world-cup-winners',
  'europe-no-outline',
  'company-slogans',
  'match-element-to-symbol',
  'opening-lines',
  'match-empire-to-capital',
  'name-the-painting',
  'name-the-state-from-its-quarter',
];

const QOTD_EPOCH = '2026-07-01';
function dayIndex(ymd) {
  return Math.round((Date.parse(ymd + 'T00:00:00.000Z') - Date.parse(QOTD_EPOCH + 'T00:00:00.000Z')) / 86400000);
}

// Resolve the Quiz-of-the-Day quiz id for an Eastern YYYY-MM-DD. `existing` is an
// optional Set of valid quiz ids; ids not in it (or not heroed) are skipped, so a
// retired or heroless quiz never surfaces. Returns null only if nothing qualifies.
export function qotdIdFor(ymd, existing) {
  const ok = (id) => !!(id && QUIZ_HEROES[id] && (!existing || existing.has(id)));
  const pin = QOTD_OVERRIDES[ymd];
  if (ok(pin)) return pin;
  const pool = QOTD_POOL.filter(ok);
  if (!pool.length) return null;
  const i = ((dayIndex(ymd) % pool.length) + pool.length) % pool.length;
  return pool[i];
}
