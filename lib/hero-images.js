// Hero photos for the top-3 tiles on the list overview page.
// Key: list ID -> item name (exact string, parenthetical included) -> either
// a string path/URL, or preferably an object { src, credit, creditUrl }:
//   src       - a remote https image URL (preferred; optimized + cached by
//               next/image at request time, no bytes stored in the repo) or
//               a path under /public for legacy local files.
//   credit    - REQUIRED for new entries; the photo source shown as a small
//               overlay caption on the tile (publication / venue / photographer).
//   creditUrl - where the caption links.
// If a remote URL ever 404s, the tile falls back to the PhotoBox placeholder.
export const HERO_IMAGES = {
  'pizza-nyc': {
    'L\'Industrie Pizzeria (Williamsburg)': {
      src: 'https://28f718d42dc92b2aa25d.cdn6.editmysite.com/uploads/b/28f718d42dc92b2aa25db0887b7d74305782ccf3a0e80480f93eecbafc0ee56a/TeddyWolff.LIndustrie.NewYorkerSlice.4_Jp8wkfn_1694278184.jpg?width=1280&optimize=medium',
      credit: 'L\'Industrie · Teddy Wolff',
      creditUrl: 'https://www.lindustriebk.com',
    },
    'Lucali (Carroll Gardens)': {
      src: 'https://platform.ny.eater.com/wp-content/uploads/sites/6/chorus/uploads/chorus_asset/file/22552619/1211492460.jpg?quality=90&strip=all&crop=0,13.104817456692,100,73.790365086616',
      credit: 'Eater NY',
      creditUrl: 'https://ny.eater.com',
    },
    'Mama\'s Too (Upper West Side)': {
      src: 'https://res.cloudinary.com/the-infatuation/image/upload/c_fill,w_1280,ar_4:3,g_center,f_auto/images/MamasTooWV_KatePrevite_PepperoniSquareSlice_NYC_00005_ljzof0',
      credit: 'The Infatuation · Kate Previte',
      creditUrl: 'https://www.theinfatuation.com/new-york/reviews/mamas-too',
    },
  },
  'best-tom-hardy-movies': {
    'Mad Max: Fury Road': '/heroes/best-tom-hardy-movies/mad-max-fury-road.webp',
    'Warrior': '/heroes/best-tom-hardy-movies/warrior.webp',
    'Locke': '/heroes/best-tom-hardy-movies/locke.webp',
  },
  'best-denzel-washington-movies': {
    'Malcolm X': '/heroes/best-denzel-washington-movies/malcolm-x.webp',
    'Training Day': '/heroes/best-denzel-washington-movies/training-day.webp',
    'Glory': '/heroes/best-denzel-washington-movies/glory.webp',
  },
  'best-robin-williams-movies': {
    'Good Will Hunting': '/heroes/best-robin-williams-movies/good-will-hunting.webp',
    'Dead Poets Society': '/heroes/best-robin-williams-movies/dead-poets-society.webp',
    'Good Morning, Vietnam': '/heroes/best-robin-williams-movies/good-morning-vietnam.webp',
  },
  'best-matt-damon-movies': {
    'Good Will Hunting': '/heroes/best-matt-damon-movies/good-will-hunting.webp',
    'The Martian': '/heroes/best-matt-damon-movies/the-martian.webp',
    'The Departed': '/heroes/best-matt-damon-movies/the-departed.webp',
  },
  'best-ben-affleck-movies': {
    'Good Will Hunting': '/heroes/best-ben-affleck-movies/good-will-hunting.webp',
    'Argo': '/heroes/best-ben-affleck-movies/argo.webp',
    'Gone Girl': '/heroes/best-ben-affleck-movies/gone-girl.webp',
  },
  'best-meryl-streep-movies': {
    "Sophie's Choice": '/heroes/best-meryl-streep-movies/sophies-choice.webp',
    'Kramer vs. Kramer': '/heroes/best-meryl-streep-movies/kramer-vs-kramer.webp',
    'The Devil Wears Prada': '/heroes/best-meryl-streep-movies/the-devil-wears-prada.webp',
  },
  'best-jodie-foster-movies': {
    'The Silence of the Lambs': '/heroes/best-jodie-foster-movies/the-silence-of-the-lambs.webp',
    'Taxi Driver': '/heroes/best-jodie-foster-movies/taxi-driver.webp',
    'The Accused': '/heroes/best-jodie-foster-movies/the-accused.webp',
  },
};
