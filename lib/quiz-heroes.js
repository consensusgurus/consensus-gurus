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
  'name-every-super-bowl-winning-qb': { src: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Tom_Brady_with_Vince_Lombardi_trophy.jpg', pos: 'center 35%' },
  'mortal-kombat-1992-roster': { src: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/MortalKombat1992LegacyScreenshot.png', pos: 'center 25%' },
  'sb-starters-2016-broncos': { src: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Von_Miller_Super_Bowl_50.jpg', pos: 'center 22%' },
  'sb-starters-2015-patriots': { src: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Rob_Gronkowski_20131201.jpg', pos: 'center 20%' },
  'sb-starters-2014-seahawks': { src: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Russell_Wilson_vs._Rams_2014.jpg', pos: 'center 15%' },
  'sb-starters-2013-ravens': { src: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Ray_Lewis_MNF_2008.jpg', pos: 'center 18%' },
  'sb-starters-2012-giants': { src: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Eli_Manning_is_back_to_pass_in_warm_ups..jpg', pos: 'center 15%' },
  'sb-starters-2011-packers': { src: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Aaron_Rodgers_-_November_14%2C_2011.jpg', pos: 'center 12%' },
  'sb-starters-2010-saints': { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Drew_Brees_Saints_2008.jpg', pos: 'center 18%' },
  'sb-starters-2009-steelers': { src: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Troy_Polamalu_2013.jpg', pos: 'center 18%' },
  'sb-starters-2008-giants': { src: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Justin_tuck_2012.jpg', pos: 'center 18%' },
  'sb-starters-2007-colts': { src: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Peyton_Manning%2C_September_26%2C2010%2C_vs_Denver.jpg', pos: 'center 12%' },
  'nba-starters-2016-cavaliers': { src: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Kyrie_Irving_%2810355627426%29.jpg', pos: 'center 18%' },
  'nba-starters-2015-warriors': { src: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Andre_Iguodala_2016_%28cropped%29.jpg', pos: 'center 18%' },
  'nba-starters-2014-spurs': { src: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Tim_Duncan.jpg', pos: 'center 18%' },
  'nba-starters-2013-heat': { src: 'https://upload.wikimedia.org/wikipedia/commons/8/88/Dwyane_Wade_2012.jpg', pos: 'center 20%' },
  'nba-starters-2012-heat': { src: 'https://upload.wikimedia.org/wikipedia/commons/8/89/LeBronJamesDunkingHeat.jpg', pos: 'center 20%' },
  'nba-starters-2011-mavericks': { src: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Dirk_Nowitzki_2_%28cropped%29.jpg', pos: 'center 18%' },
  'nba-starters-2010-lakers': { src: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Kobe_Bryant_Drives2_%28cropped%29.jpg', pos: 'center 18%' },
  'nba-starters-2009-lakers': { src: 'https://upload.wikimedia.org/wikipedia/commons/7/7d/Pau_Gasol_boxout.jpg', pos: 'center 20%' },
  'nba-starters-2008-celtics': { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Paul_Pierce_2008-01-13_%28cropped%29.jpg', pos: 'center 15%' },
  'nba-starters-2007-spurs': { src: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Parker_tongue1.JPG', pos: 'center 15%' },
  'sb-starters-2026-seahawks': { src: 'https://upload.wikimedia.org/wikipedia/commons/4/43/Jaxon_Smith-Njigba_FanDuel_Interview.png', pos: 'center 25%' },
  'sb-starters-2025-eagles': { src: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Jalen_Hurts_2022_Eagles.jpg', pos: 'center 18%' },
  'sb-starters-2024-chiefs': { src: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Patrick_Mahomes_military_appreciation2018.jpg', pos: 'center 22%' },
  'sb-starters-2023-chiefs': { src: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Travis_Kelce_%2853791318648%29.jpg', pos: 'center 30%' },
  'sb-starters-2022-rams': { src: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Cooper_Kupp.jpg', pos: 'center 18%' },
  'sb-starters-2021-buccaneers': { src: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Tom_Brady_WFT-Buccaneers_NOV2021.jpg', pos: 'center 20%' },
  'sb-starters-2020-chiefs': { src: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Tyreek_Hill%2C_Khaleke_Hudson_%2851614638887%29.jpg', pos: 'center 25%' },
  'sb-starters-2019-patriots': { src: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Julian_Edelman_In_2019.jpg', pos: 'center 25%' },
  'sb-starters-2018-eagles': { src: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Fletcher_Cox_2019.jpg', pos: 'center 22%' },
  'sb-starters-2017-patriots': { src: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Tom_Brady_2017.JPG', pos: 'center 22%' },
  'nba-starters-2026-knicks': { src: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Jalen_Brunson_2023_%28cropped%29.jpg', pos: 'center 15%' },
  'nba-starters-2025-thunder': { src: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Shai_Gilgeous-Alexander_%2851815871018%29_%28cropped%29.jpg', pos: 'center 18%' },
  'nba-starters-2024-celtics': { src: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Jayson_Tatum_%28cropped%29.jpg', pos: 'center 15%' },
  'nba-starters-2023-nuggets': { src: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Nikola_Jokic_free_throw_%28cropped%29.jpg', pos: 'center 18%' },
  'nba-starters-2022-warriors': { src: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Stephen_Curry_%2816454505719%29.jpg', pos: 'center 22%' },
  'nba-starters-2021-bucks': { src: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Giannis_Antetokounmpo_%2824845003687%29_%28cropped%29.jpg', pos: 'center 15%' },
  'nba-starters-2020-lakers': { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/LeBron_James_-_51959723161.jpg', pos: 'center 18%' },
  'nba-starters-2019-raptors': { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/1_kawhi_leonard_2019_%28cropped%29.jpg', pos: 'center 20%' },
  'nba-starters-2018-warriors': { src: 'https://upload.wikimedia.org/wikipedia/commons/0/09/Kevin_Durant_Warriors_2019_%28cropped%29.jpg', pos: 'center 15%' },
  'nba-starters-2017-warriors': { src: 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Golden_State_Warriors_Point_Guard_Stephen_Curry_01.jpg', pos: 'center 25%' },
  'the-white-lotus-character-match':      { src: 'https://image.tmdb.org/t/p/original/w9Fj6q6YSXBZmGZCsxAo1ekO6If.jpg', pos: 'center 30%' },
  'cities-most-skyscrapers-world':          { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Hong_Kong_Night_Skyline.jpg/1280px-Hong_Kong_Night_Skyline.jpg', pos: 'center 45%' },
  'mlb-career-history':                     { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Shohei_Ohtani_vs_Orioles_2022.jpg/1280px-Shohei_Ohtani_vs_Orioles_2022.jpg', pos: 'center 20%' },
  'nba-career-history':                     { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/LeBron_James_dribbling_%28March_21%2C_2022%29.jpg/1280px-LeBron_James_dribbling_%28March_21%2C_2022%29.jpg', pos: 'center 20%' },
  'nfl-career-history':                     { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Tom_Brady_WFT-Buccaneers_NOV2021.jpg/1280px-Tom_Brady_WFT-Buccaneers_NOV2021.jpg', pos: 'center 20%' },
  'name-the-movie-from-poster':             { src: 'https://image.tmdb.org/t/p/w780/AmyQTQsNxITitCM0Ya5l5bpYGpn.jpg', pos: 'center 32%' },
  'match-rapper-hometown':                  { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/50_cent_en_concierto.jpg/1280px-50_cent_en_concierto.jpg' },
  'gaming-pokemon-to-type':                 { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/SNES-Controller-in-Hand.jpg/1280px-SNES-Controller-in-Hand.jpg' },
  'name-the-ski-resort-from-the-trail-map': { src: 'https://files.skimap.org/ow2dq6ieejhm6xhm5pz1zvvntpsy', pos: 'center 40%' },
  'world-cup-winners':                      { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Stadium_of_Football_Club_FC_Barcelona_-_Camp_Nou.jpg/1280px-Stadium_of_Football_Club_FC_Barcelona_-_Camp_Nou.jpg' },
  'europe-no-outline':                      { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Europe_%28MODIS_2017-04-22%29.jpg/1280px-Europe_%28MODIS_2017-04-22%29.jpg' },
  'canada-provinces-no-outline':            { src: '/outlines/north-american-countries__canada.svg', pos: 'center' },
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
  'top-grossing-julia-roberts-movies':      { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Julia_Roberts_2025.jpg/960px-Julia_Roberts_2025.jpg', pos: 'center 18%' },
  'top-grossing-meryl-streep-movies':       { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Meryl_Streep-_Press_conference_for_the_film_%22The_Devil_Wears_Prada_2%22_-_55194765350_%28cropped1%29.jpg/960px-Meryl_Streep-_Press_conference_for_the_film_%22The_Devil_Wears_Prada_2%22_-_55194765350_%28cropped1%29.jpg', pos: 'center 15%' },
  'top-grossing-sandra-bullock-movies':     { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Sandra_Bullock_at_The_Egyptian_Theatre_2024.jpg/960px-Sandra_Bullock_at_The_Egyptian_Theatre_2024.jpg', pos: 'center 15%' },
  'top-grossing-scarlett-johansson-movies': { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Scarlett_Johansson-8588.jpg/960px-Scarlett_Johansson-8588.jpg', pos: 'center 18%' },
  'top-grossing-jennifer-lawrence-movies':  { src: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Jennifer_Lawrence_in_2018.png', pos: 'center 18%' },
  'top-grossing-angelina-jolie-movies':     { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Angelina_Jolie-643531_%28cropped%29.jpg/960px-Angelina_Jolie-643531_%28cropped%29.jpg', pos: 'center 18%' },
  'nba-arena-state-1-strike':               { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Crypto.com_Arena_interior_2024.jpg/1280px-Crypto.com_Arena_interior_2024.jpg', pos: 'center 55%' },
  'mlb-ballpark-state-1-strike':            { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Wrigley_Field_in_line_with_sign.jpg/1280px-Wrigley_Field_in_line_with_sign.jpg' },
  'artworks-to-museums-pt-1':               { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg', pos: 'center 35%' },
  'artworks-to-museums-pt-2':               { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/1280px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg', pos: 'center 30%' },
  'artworks-to-museums-pt-3':               { src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg/1280px-A_Sunday_on_La_Grande_Jatte%2C_Georges_Seurat%2C_1884.jpg', pos: 'center 45%' },
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
