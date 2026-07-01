// Quiz hero images — one landscape banner photo per category, for the restyled
// quiz hub where each category list shows a "hero quiz" at the top.
//
// Keyed by department id (see DEPT_NAV in lib/quiz-departments.js). The quizId is
// the TOP quiz displayed in that category's list, i.e. the most-played quiz in the
// department (Business excludes the Business News hub quizzes), computed 2026-06-30.
//
// Every hero is a Wikimedia Commons photo served as a 1280px JPEG thumbnail. Each
// URL was verified live through the site image optimizer (/_next/image -> 200
// image/jpeg) and visually reviewed for subject + quality. No WebP/AVIF (Satori-safe).
// Thumbnails (not originals) are used on purpose: two originals are ~100 megapixels
// and the optimizer renders them blank, so always link the /thumb/.../1280px- form.
//
// hero is a plain URL string, matching QUIZ_OF_DAY.hero in app/quizzes/QuizHomeClient.jsx.
// Credit (Commons file page) for each is listed in HERO_CREDITS below.

export const CATEGORY_HEROES = {
  // dept        top quiz (most-played in category)                photo
  movies:        { quizId: 'name-the-movie-from-poster',           hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Guild_Cinema_at_night%2C_Albuquerque_NM.jpg/1280px-Guild_Cinema_at_night%2C_Albuquerque_NM.jpg' }, // lit cinema marquee at night
  music:         { quizId: 'match-rapper-hometown',                hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/50_cent_en_concierto.jpg/1280px-50_cent_en_concierto.jpg' }, // 50 Cent performing (rapper)
  gaming:        { quizId: 'gaming-pokemon-to-type',               hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/SNES-Controller-in-Hand.jpg/1280px-SNES-Controller-in-Hand.jpg' }, // hands on an SNES controller
  travel:        { quizId: 'name-the-ski-resort-from-the-trail-map', hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Skiers_at_SkiWelt_Wilder_Kaiser-Brixental_Austrian_Alps_2026.JPG/1280px-Skiers_at_SkiWelt_Wilder_Kaiser-Brixental_Austrian_Alps_2026.JPG' }, // Austrian Alps ski slopes
  sports:        { quizId: 'world-cup-winners',                    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Stadium_of_Football_Club_FC_Barcelona_-_Camp_Nou.jpg/1280px-Stadium_of_Football_Club_FC_Barcelona_-_Camp_Nou.jpg' }, // packed football stadium
  geography:     { quizId: 'europe-no-outline',                    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Europe_%28MODIS_2017-04-22%29.jpg/1280px-Europe_%28MODIS_2017-04-22%29.jpg' }, // MODIS satellite of Europe
  food:          { quizId: 'nyc-restaurant-geo-guesser',           hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Katz%27s_Delicatessen_%2851623899326%29.jpg/1280px-Katz%27s_Delicatessen_%2851623899326%29.jpg' }, // Katz's Deli (same photo as the current Quiz of the Day)
  business:      { quizId: 'company-slogans',                      hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/New_york_times_square-terabass.jpg/1280px-New_york_times_square-terabass.jpg' }, // Times Square billboards
  science:       { quizId: 'match-element-to-symbol',              hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/%C3%80t%E1%BA%B9_%C3%88r%C3%B2j%C3%A0_Al%C3%A1%C3%ACl%C3%A1b%C3%B9l%C3%A0_%28Yoruba_Periodic_Table_of_the_Elements%29.jpg/1280px-%C3%80t%E1%BA%B9_%C3%88r%C3%B2j%C3%A0_Al%C3%A1%C3%ACl%C3%A1b%C3%B9l%C3%A0_%28Yoruba_Periodic_Table_of_the_Elements%29.jpg' }, // colorful periodic table (universal symbols; category labels are Yoruba)
  entertainment: { quizId: 'match-the-succession-character',       hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/SRF_Studio_Zurich_Leutschenbach_Ank_Kumar_Infosys_Limited_04.jpg/1280px-SRF_Studio_Zurich_Leutschenbach_Ank_Kumar_Infosys_Limited_04.jpg' }, // TV broadcast studio
  literature:    { quizId: 'opening-lines',                        hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Bibliotheca_Bodleiana.jpg/1280px-Bibliotheca_Bodleiana.jpg' }, // Bodleian Library, Oxford
  history:       { quizId: 'match-empire-to-capital',              hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg' }, // Roman Colosseum
  arts:          { quizId: 'name-the-painting',                    hero: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/1280px-Louvre_Museum_Wikimedia_Commons.jpg' }, // the Louvre at dusk
};

// The four specifically-requested quizzes (the quarter quiz + the LA / London /
// Paris geo guessers). Keyed by quiz id -> hero URL.
export const NAMED_QUIZ_HEROES = {
  'name-the-state-from-its-quarter':   'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/2022_Washington_quarter_obverse.jpeg/1280px-2022_Washington_quarter_obverse.jpeg', // clean Washington-quarter close-up (non-spoiler)
  'los-angeles-landmarks-geo-guesser': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Skyline_of_Los_Angeles%2C_Downtown_Los_Angeles%2C_California_13.jpg/1280px-Skyline_of_Los_Angeles%2C_Downtown_Los_Angeles%2C_California_13.jpg', // downtown LA skyline at dusk
  'london-landmarks-geo-guesser-pt-1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/London_Thames_Sunset_panorama_-_Feb_2008.jpg/1280px-London_Thames_Sunset_panorama_-_Feb_2008.jpg', // Tower Bridge + City skyline at sunset
  'paris-landmarks-geo-guesser-pt-1':  'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Paris_pano_%40_Cit%C3%A9_de_l%27Architecture_et_du_Patrimoine_roof.jpg/1280px-Paris_pano_%40_Cit%C3%A9_de_l%27Architecture_et_du_Patrimoine_roof.jpg', // Paris cityscape with the Eiffel Tower from Trocadero
};

// Attribution — Wikimedia Commons file pages (for a credit caption if the restyle
// shows one; the current QUIZ_OF_DAY banner does not render a credit).
export const HERO_CREDITS = {
  movies:        'https://commons.wikimedia.org/wiki/File:Guild_Cinema_at_night,_Albuquerque_NM.jpg',
  music:         'https://commons.wikimedia.org/wiki/File:50_cent_en_concierto.jpg',
  gaming:        'https://commons.wikimedia.org/wiki/File:SNES-Controller-in-Hand.jpg',
  travel:        'https://commons.wikimedia.org/wiki/File:Skiers_at_SkiWelt_Wilder_Kaiser-Brixental_Austrian_Alps_2026.JPG',
  sports:        'https://commons.wikimedia.org/wiki/File:Stadium_of_Football_Club_FC_Barcelona_-_Camp_Nou.jpg',
  geography:     'https://commons.wikimedia.org/wiki/File:Europe_(MODIS_2017-04-22).jpg',
  food:          'https://commons.wikimedia.org/wiki/File:Katz%27s_Delicatessen_(51623899326).jpg',
  business:      'https://commons.wikimedia.org/wiki/File:New_york_times_square-terabass.jpg',
  science:       'https://commons.wikimedia.org/wiki/File:%C3%80t%E1%BA%B9_%C3%88r%C3%B2j%C3%A0_Al%C3%A1%C3%ACl%C3%A1b%C3%B9l%C3%A0_(Yoruba_Periodic_Table_of_the_Elements).jpg',
  entertainment: 'https://commons.wikimedia.org/wiki/File:SRF_Studio_Zurich_Leutschenbach_Ank_Kumar_Infosys_Limited_04.jpg',
  literature:    'https://commons.wikimedia.org/wiki/File:Bibliotheca_Bodleiana.jpg',
  history:       'https://commons.wikimedia.org/wiki/File:Colosseo_2020.jpg',
  arts:          'https://commons.wikimedia.org/wiki/File:Louvre_Museum_Wikimedia_Commons.jpg',
  'name-the-state-from-its-quarter':   'https://commons.wikimedia.org/wiki/File:2022_Washington_quarter_obverse.jpeg',
  'los-angeles-landmarks-geo-guesser': 'https://commons.wikimedia.org/wiki/File:Skyline_of_Los_Angeles,_Downtown_Los_Angeles,_California_13.jpg',
  'london-landmarks-geo-guesser-pt-1': 'https://commons.wikimedia.org/wiki/File:London_Thames_Sunset_panorama_-_Feb_2008.jpg',
  'paris-landmarks-geo-guesser-pt-1':  'https://commons.wikimedia.org/wiki/File:Paris_pano_@_Cit%C3%A9_de_l%27Architecture_et_du_Patrimoine_roof.jpg',
};
